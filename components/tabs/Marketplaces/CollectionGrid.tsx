"use client";

import Link from "next/link";
import type { MarketplaceCollection } from "@/types";
import { formatUsdFromEth } from "@/lib/utils";

const skeletonKeys = Array.from({ length: 8 }, (_, index) => `skeleton-${index}`);

export default function CollectionGrid({
  items,
  isLoading = false,
}: {
  items: MarketplaceCollection[];
  isLoading?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {isLoading
        ? skeletonKeys.map((key) => (
            <div
              key={key}
              className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/60 p-3"
            >
              <div className="aspect-square rounded-xl bg-slate-800" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-slate-700" />
                <div className="h-2 w-1/2 rounded-full bg-slate-800" />
              </div>
            </div>
          ))
        : items.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collection/${collection.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-slate-900/80"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-800">
                {collection.imageUrl ? (
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-slate-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {collection.name}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {collection.description || "Trending collection on OpenSea."}
                </p>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400">
                  <span>
                    {typeof collection.floorPrice === "number"
                      ? `Floor ${collection.floorPrice} ETH`
                      : "Floor N/A"}
                    {typeof collection.floorPrice === "number"
                      ? (() => {
                          const usd = formatUsdFromEth(collection.floorPrice);
                          return usd ? ` (${usd})` : "";
                        })()
                      : ""}
                  </span>
                  <span>
                    {typeof collection.totalSupply === "number"
                      ? `${collection.totalSupply} items`
                      : "OpenSea"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
    </div>
  );
}
