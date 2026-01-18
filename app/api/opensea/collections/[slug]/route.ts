import { NextResponse } from "next/server";
import {
  fetchCollection,
  fetchCollectionNFTs,
  fetchCollectionStats,
  fetchNFTPrice,
  mapChainIdToOpenSeaChain,
} from "@/lib/opensea";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: RouteParams) {
  try {
    const { slug } = await context.params;
    if (!slug || slug === "undefined") {
      return NextResponse.json(
        {
          collection: null,
          nfts: [],
          error: "Collection slug is required.",
        },
        { status: 400 },
      );
    }
    const { searchParams } = new URL(request.url);
    const chainIdParam = searchParams.get("chainId");
    const chainId = chainIdParam ? Number(chainIdParam) : undefined;
    const chainOverride = chainId
      ? mapChainIdToOpenSeaChain(chainId)
      : undefined;
    const [collectionResult, nftsResult, statsResult] = await Promise.allSettled(
      [
        fetchCollection(slug),
        fetchCollectionNFTs(slug, 20),
        fetchCollectionStats(slug),
      ],
    );
    const collection =
      collectionResult.status === "fulfilled" ? collectionResult.value : null;
    const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];
    const stats =
      statsResult.status === "fulfilled" ? statsResult.value : null;
    const collectionChain = chainOverride ?? collection?.contracts?.[0]?.chain;

    const pricedNfts = await Promise.all(
      nfts.map(async (nft) => {
        const price = await fetchNFTPrice(
          nft.contract,
          nft.identifier,
          collectionChain,
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
    const fallbackImage =
      pricedNfts.find((item) => item.imageUrl)?.imageUrl ?? "";
    const fallbackName = pricedNfts[0]?.collection ?? slug;

    if (!collection && nfts.length === 0) {
      const message =
        collectionResult.status === "rejected" && collectionResult.reason
          ? String(collectionResult.reason)
          : "Collection not found.";
      return NextResponse.json(
        {
          collection: null,
          nfts: [],
          error: message,
        },
        { status: 404 },
      );
    }

    const resolvedCollection = collection
      ? {
          slug: collection.collection ?? slug,
          name: collection.name ?? "Untitled",
          description: collection.description ?? "",
          imageUrl: collection.image_url ?? fallbackImage,
          bannerImageUrl: collection.banner_image_url ?? "",
          floorPrice:
            typeof stats?.floor_price === "number" ? stats.floor_price : null,
          totalSupply:
            typeof stats?.total_supply === "number"
              ? stats.total_supply
              : typeof collection.total_supply === "number"
                ? collection.total_supply
                : null,
          totalVolume:
            typeof stats?.total_volume === "number" ? stats.total_volume : null,
          topOffer:
            typeof stats?.top_offer === "number" ? stats.top_offer : null,
          numOwners:
            typeof stats?.num_owners === "number" ? stats.num_owners : null,
        }
      : {
          slug,
          name: fallbackName,
          description: "",
          imageUrl: fallbackImage,
          bannerImageUrl: "",
          floorPrice:
            typeof stats?.floor_price === "number" ? stats.floor_price : null,
          totalSupply:
            typeof stats?.total_supply === "number" ? stats.total_supply : null,
          totalVolume:
            typeof stats?.total_volume === "number" ? stats.total_volume : null,
          topOffer:
            typeof stats?.top_offer === "number" ? stats.top_offer : null,
          numOwners:
            typeof stats?.num_owners === "number" ? stats.num_owners : null,
        };

    return NextResponse.json({
      collection: resolvedCollection,
      nfts: pricedNfts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        collection: null,
        nfts: [],
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
