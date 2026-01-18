import { NextResponse } from "next/server";
import {
  fetchCollectionStats,
  fetchCollectionsBySearch,
  fetchTrendingCollections,
} from "@/lib/opensea";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() ?? "";
    const chainIdParam = searchParams.get("chainId");
    const chainId = chainIdParam ? Number(chainIdParam) : undefined;
    const collections = query
      ? await fetchCollectionsBySearch(query, 20, chainId)
      : await fetchTrendingCollections(20, chainId);
    const mapped = collections
      .map((collection) => {
        const slug = collection.slug ?? "";
        const fallback = collection.collection ?? "";
        const isSlugLike = /^[a-z0-9-]+$/i.test(fallback);
        const resolvedSlug = slug || (isSlugLike ? fallback : "");
        return {
          slug: resolvedSlug,
          name: collection.name ?? collection.collection ?? "Untitled",
          description: collection.description ?? "",
          imageUrl: collection.image_url ?? "",
          bannerImageUrl: collection.banner_image_url ?? "",
          floorPrice:
            typeof collection.stats?.floor_price === "number"
              ? collection.stats.floor_price
              : null,
          totalSupply:
            typeof collection.stats?.total_supply === "number"
              ? collection.stats.total_supply
              : null,
          totalVolume: null,
          numOwners: null,
          topOffer: null,
        };
      })
      .filter((collection) => Boolean(collection.slug));

    const stats = await Promise.all(
      mapped.map(async (collection) => {
        try {
          const data = await fetchCollectionStats(collection.slug);
          return { slug: collection.slug, stats: data };
        } catch {
          return { slug: collection.slug, stats: null };
        }
      }),
    );

    const collectionsWithStats = mapped.map((collection) => {
      const stat = stats.find((item) => item.slug === collection.slug)?.stats;
      return {
        ...collection,
        floorPrice:
          typeof stat?.floor_price === "number"
            ? stat.floor_price
            : collection.floorPrice,
        totalVolume:
          typeof stat?.total_volume === "number" ? stat.total_volume : null,
        numOwners:
          typeof stat?.num_owners === "number" ? stat.num_owners : null,
        topOffer: typeof stat?.top_offer === "number" ? stat.top_offer : null,
      };
    });

    return NextResponse.json({
      collections: collectionsWithStats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        collections: [],
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
