import { NextResponse } from "next/server";
import {
  fetchUserListingsForChain,
  mapChainIdToOpenSeaChain,
} from "@/lib/opensea";

type ListingAsset = {
  token: string;
  identifier: string;
};

async function fetchNftDetails(
  token: string,
  identifier: string,
  chainId?: number,
) {
  const chain = mapChainIdToOpenSeaChain(chainId);
  const url = `https://api.opensea.io/api/v2/chain/${chain}/contract/${token}/nfts/${identifier}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-API-KEY": process.env.OPENSEA_API_KEY ?? "",
    },
  });
  if (!response.ok) return null;
  return (await response.json()) as {
    nft?: {
      identifier?: string;
      name?: string;
      description?: string;
      image_url?: string;
      display_image_url?: string;
      collection?: string;
      contract?: string;
      opensea_url?: string;
    };
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainIdParam = searchParams.get("chainId");
  const limitParam = searchParams.get("limit");

  if (!address) {
    return NextResponse.json(
      { listings: [], error: "Missing address" },
      { status: 400 },
    );
  }

  const chainId = chainIdParam ? Number(chainIdParam) : undefined;
  const limit = limitParam ? Number(limitParam) : 10;

  try {
    const { orders = [] } = await fetchUserListingsForChain(
      address,
      chainId,
      limit,
    );

    const assets: ListingAsset[] = orders
      .map((order) => {
        const offer = order.protocol_data?.parameters?.offer?.[0];
        if (!offer?.token || !offer.identifierOrCriteria) return null;
        return {
          token: offer.token,
          identifier: offer.identifierOrCriteria,
        };
      })
      .filter((asset): asset is ListingAsset => Boolean(asset));

    const nftDetails = await Promise.all(
      assets.map((asset) =>
        fetchNftDetails(asset.token, asset.identifier, chainId),
      ),
    );

    const listings = orders.map((order, index) => {
      const nft = nftDetails[index]?.nft;
      const rawPrice = order.current_price ?? "0";
      const decimals = Number(order.payment_token?.decimals ?? 18);
      const price =
        decimals > 0
          ? (BigInt(rawPrice) / BigInt(10) ** BigInt(decimals)).toString()
          : rawPrice;

      return {
        id:
          order.order_hash ??
          `${nft?.contract ?? assets[index]?.token}-${nft?.identifier ?? assets[index]?.identifier}`,
        name: nft?.name ?? "Untitled",
        tokenId: nft?.identifier ?? assets[index]?.identifier ?? "",
        contractAddress: nft?.contract ?? assets[index]?.token ?? "",
        imageUrl: nft?.display_image_url ?? nft?.image_url ?? "",
        collection: nft?.collection ?? "",
        description: nft?.description ?? "",
        openseaUrl: nft?.opensea_url ?? "",
        price: {
          amount: price,
          currency: order.payment_token?.symbol ?? "ETH",
        },
        listingOrder: order,
      };
    });

    return NextResponse.json({ listings });
  } catch (error) {
    return NextResponse.json(
      {
        listings: [],
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
