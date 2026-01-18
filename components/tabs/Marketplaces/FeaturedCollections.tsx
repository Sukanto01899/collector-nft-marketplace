"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketplaceCollection } from "@/types";
import FeaturedCard from "@/components/tabs/Marketplaces/FeaturedCard";

export default function FeaturedCollections({
  items,
}: {
  items: MarketplaceCollection[];
}) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = useMemo(() => items.slice(0, 3), [items]);
  const activeFeatured = featured[featuredIndex];

  useEffect(() => {
    if (featuredIndex >= featured.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, featured.length]);

  if (featured.length === 0) return null;

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/60 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
            Featured
          </p>
          <h2 className="text-lg font-semibold text-slate-50">Most Trending</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
          <button
            type="button"
            onClick={() =>
              setFeaturedIndex((prev) =>
                prev === 0 ? featured.length - 1 : prev - 1,
              )
            }
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-emerald-300/40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() =>
              setFeaturedIndex((prev) =>
                prev === featured.length - 1 ? 0 : prev + 1,
              )
            }
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-emerald-300/40"
          >
            Next
          </button>
        </div>
      </div>
      {activeFeatured ? (
        <div>
          <FeaturedCard
            item={activeFeatured}
          />
          <div className="mt-3 flex items-center gap-2">
            {featured.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setFeaturedIndex(index)}
                className={`h-2 w-8 rounded-full transition ${
                  index === featuredIndex ? "bg-emerald-300" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
