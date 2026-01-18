"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChainId } from "wagmi";
import { useFrame } from "@/components/providers/farcaster-provider";
import { SafeAreaContainer } from "@/components/providers/safe-area-container";
import LoadingPage from "@/components/common/LoadingPage";
import FixedHeader from "@/components/common/FixedHeader";
import BottomNav from "@/components/common/BottomNav";
import NFTGalleryContainer from "@/components/containers/NFTGalleryContainer";
import type { MarketplaceCollection } from "@/types";
import type { NftGalleryItem } from "@/components/ui/NFTGalleryView";

type CollectionResponse = {
  collection: MarketplaceCollection | null;
  nfts: NftGalleryItem[];
};

export default function CollectionPageClient({ slug }: { slug: string }) {
  const { context, isLoading, isSDKLoaded } = useFrame();
  const router = useRouter();
  const chainId = useChainId();
  const [collection, setCollection] = useState<MarketplaceCollection | null>(
    null,
  );
  const [items, setItems] = useState<NftGalleryItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (value?: number | null, digits = 2) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
    }).format(value);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadCollection() {
      setIsDataLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (chainId) {
          params.set("chainId", String(chainId));
        }
        const queryParam = params.toString() ? `?${params.toString()}` : "";
        const response = await fetch(
          `/api/opensea/collections/${slug}${queryParam}`,
        );
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Failed to load collection.");
        }
        const data = (await response.json()) as CollectionResponse;
        if (isMounted) {
          setCollection(data.collection ?? null);
          setItems(data.nfts ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load.");
          setCollection(null);
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    }

    loadCollection();

    return () => {
      isMounted = false;
    };
  }, [slug, chainId]);

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <LoadingPage />
      </SafeAreaContainer>
    );
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <FixedHeader />
      <div className="px-3 pb-24 pt-20 sm:pb-8 sm:pt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
              Collection
            </p>
            <h2 className="text-lg font-semibold text-slate-50">
              {collection?.name ?? "Collection"}
            </h2>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
          {isDataLoading ? (
            <div className="animate-pulse">
              <div className="h-32 w-full bg-slate-800 sm:h-40" />
              <div className="relative px-4 pb-4 pt-12">
                <div className="absolute -top-8 left-4 h-16 w-16 rounded-full bg-slate-800 sm:h-20 sm:w-20" />
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="h-3 w-3/4 rounded-full bg-slate-700" />
                  <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide">
                    {Array.from({ length: 5 }, (_, index) => (
                      <div
                        key={`stat-skeleton-${index}`}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-2"
                      >
                        <div className="h-2 w-1/2 rounded-full bg-slate-800" />
                        <div className="mt-2 h-3 w-3/4 rounded-full bg-slate-700" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative h-32 w-full bg-slate-900/80 sm:h-40">
                {collection?.bannerImageUrl || collection?.imageUrl ? (
                  <img
                    src={collection?.bannerImageUrl || collection?.imageUrl}
                    alt={collection?.name ?? "Collection cover"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-slate-500">
                    No Cover Image
                  </div>
                )}
                <div className="absolute -bottom-8 left-4 h-16 w-16 overflow-hidden rounded-full border-2 border-slate-900 bg-slate-900 shadow-lg sm:h-20 sm:w-20">
                  {collection?.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection?.name ?? "Collection image"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-slate-500">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 px-4 pb-4 pt-12 text-sm text-slate-300">
                <p className="text-sm text-slate-300 line-clamp-2">
                  {collection?.description || "No description available."}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-slate-500">Floor</p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {typeof collection?.floorPrice === "number"
                        ? `${formatNumber(collection.floorPrice, 4)} ETH`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-slate-500">Supply</p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {typeof collection?.totalSupply === "number"
                        ? `${formatNumber(collection.totalSupply, 0)}`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-slate-500">Total Volume</p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {typeof collection?.totalVolume === "number"
                        ? `${formatNumber(collection.totalVolume, 2)} ETH`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-slate-500">Top Offer</p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {typeof collection?.topOffer === "number"
                        ? `${formatNumber(collection.topOffer, 4)} ETH`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-slate-500">Owners</p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {typeof collection?.numOwners === "number"
                        ? `${formatNumber(collection.numOwners, 0)}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs font-semibold uppercase tracking-wide text-rose-200">
            {error}
          </div>
        ) : null}

        <NFTGalleryContainer
          items={items}
          isLoading={isDataLoading}
          viewOptions={{ showTokenId: false, showSell: false, showCancel: false }}
        />
      </div>
      <BottomNav />
    </SafeAreaContainer>
  );
}
