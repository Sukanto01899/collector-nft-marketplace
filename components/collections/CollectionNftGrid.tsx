"use client";

import type { NftGalleryItem } from "@/components/ui/NFTGalleryView";

const skeletonKeys = Array.from({ length: 8 }, (_, index) => `skeleton-${index}`);

const statusLabel = (item: NftGalleryItem) =>
  item.price ? "Listed" : "Not Listed";

export default function CollectionNftGrid({
  items,
  isLoading = false,
}: {
  items: NftGalleryItem[];
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
        : items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-slate-500">
                    No Image
                  </div>
                )}
                {item.price ? (
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-400/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-950 shadow">
                    {item.price.amount} {item.price.currency}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">Token #{item.tokenId}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      item.price ? "text-emerald-300" : "text-slate-400"
                    }`}
                  >
                    {statusLabel(item)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.collection ?? "OpenSea"}
                  </span>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}
