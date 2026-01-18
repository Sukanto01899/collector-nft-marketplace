import { NextResponse } from "next/server";
import { fetchNFTPrice, fetchUserNFTsForChain, mapChainIdToOpenSeaChain } from "@/lib/opensea";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainIdParam = searchParams.get("chainId");

  if (!address) {
    return NextResponse.json(
      { nfts: [], error: "Missing address" },
      { status: 400 },
    );
  }

  const chainId = chainIdParam ? Number(chainIdParam) : undefined;
  const chainOverride = chainId ? mapChainIdToOpenSeaChain(chainId) : undefined;

  try {
    const data = await fetchUserNFTsForChain(address, chainId);
    const pricedNfts = await Promise.all(
      (data.nfts ?? []).map(async (nft) => {
        const price = await fetchNFTPrice(
          nft.contract,
          nft.identifier,
          chainOverride,
        ).catch(() => null);
        return {
          id: `${nft.contract}-${nft.identifier}`,
          name: nft.name ?? "Untitled",
          tokenId: nft.identifier,
          contractAddress: nft.contract,
          imageUrl: nft.display_image_url ?? nft.image_url ?? "",
          collection: nft.collection,
          description: nft.description ?? "",
          openseaUrl: nft.opensea_url ?? "",
          price: price
            ? { amount: price.price, currency: price.currency }
            : undefined,
          listingOrder: price?.order,
        };
      }),
    );
    return NextResponse.json({
      nfts: pricedNfts,
      next: data.next ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        nfts: [],
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
