"use client";

import Link from "next/link";
import type { MarketplaceCollection } from "@/types";
import { formatUsdFromEth } from "@/lib/utils";

export default function FeaturedCard({
  item,
}: {
  item: MarketplaceCollection;
}) {
  const floorLabel =
    typeof item.floorPrice === "number" ? `${item.floorPrice} ETH` : "N/A";
  const floorUsd =
    typeof item.floorPrice === "number"
      ? formatUsdFromEth(item.floorPrice)
      : null;
  const supplyLabel =
    typeof item.totalSupply === "number" ? `${item.totalSupply}` : "OpenSea";

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr] sm:min-h-[220px]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-44 w-full object-cover sm:h-[220px]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-44 items-center justify-center text-xs uppercase tracking-widest text-slate-500 sm:h-[220px]">
            No Image
          </div>
        )}
      </div>
      <div className="flex h-full flex-col justify-between space-y-3 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
          <p className="mt-2 text-xl font-semibold text-slate-50">
            {item.name}
          </p>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2">
            {item.description || "Trending collection on OpenSea."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-wide">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
            <p className="text-slate-500">Floor</p>
            <p className="mt-1 font-semibold text-slate-100">{floorLabel}</p>
            {floorUsd ? (
              <p className="mt-1 text-[10px] text-slate-500">{floorUsd}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
            <p className="text-slate-500">Supply</p>
            <p className="mt-1 font-semibold text-slate-100">{supplyLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
            <p className="text-slate-500">Explore</p>
            <Link
              href={`/collection/${item.slug}`}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200 transition hover:text-emerald-100"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
