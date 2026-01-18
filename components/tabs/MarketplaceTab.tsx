"use client";

import { useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import type { MarketplaceCollection } from "@/types";
import FeaturedCollections from "@/components/tabs/Marketplaces/FeaturedCollections";
import CollectionGrid from "@/components/tabs/Marketplaces/CollectionGrid";

type CollectionsResponse = {
  collections: MarketplaceCollection[];
};

export default function MarketplaceTab() {
  const [collections, setCollections] = useState<MarketplaceCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const chainId = useChainId();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadCollections() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) {
          params.set("query", debouncedQuery);
        }
        if (chainId) {
          params.set("chainId", String(chainId));
        }
        const queryParam = params.toString() ? `?${params.toString()}` : "";
        const response = await fetch(`/api/opensea/collections${queryParam}`);
        if (!response.ok) {
          throw new Error("Failed to load OpenSea data.");
        }
        const data = (await response.json()) as CollectionsResponse;
        if (isMounted) {
          setCollections(data.collections ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load.");
          setCollections([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, chainId]);

  const featuredCollections = useMemo(
    () => (debouncedQuery ? [] : collections),
    [collections, debouncedQuery],
  );

  return (
    <div className="px-3 pb-24 pt-20 sm:pb-8 sm:pt-12 space-y-4">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
        <label
          htmlFor="marketplace-search"
          className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70"
        >
          Search Collections
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2">
          <input
            id="marketplace-search"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Azuki, Pudgy Penguins, Farcaster..."
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <FeaturedCollections items={featuredCollections} />
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs font-semibold uppercase tracking-wide text-rose-200">
          {error}
        </div>
      ) : null}
      <CollectionGrid items={collections} isLoading={isLoading} />
    </div>
  );
}
