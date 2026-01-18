"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { truncateAddress } from "@/lib/utils";
import { useFrame } from "@/components/providers/farcaster-provider";
import NFTGalleryContainer from "@/components/containers/NFTGalleryContainer";
import type { NftGalleryItem } from "@/components/ui/NFTGalleryView";

const tabs = ["items", "listings", "offers", "activity"] as const;
const networkLabels = new Map<number, string>([
  [8453, "Base"],
  [1, "Ethereum"],
  [10, "Optimism"],
  [42161, "Arbitrum"],
  [137, "Polygon"],
  [42220, "Celo"],
  [7777777, "Zora"],
]);

export default function ProfileTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { context } = useFrame();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("items");
  const [items, setItems] = useState<NftGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [listings, setListings] = useState<NftGalleryItem[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [listingsPage, setListingsPage] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const username = context?.user?.username ?? "collector";
  const displayName = context?.user?.displayName ?? "Collector";
  const networkLabel = networkLabels.get(chainId ?? 0) ?? "Base";
  const avatarUrl =
    context?.user?.pfpUrl ||
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=400&q=80";
  const bio = "Curating onchain art and collecting moments across Base and Ethereum.";

  useEffect(() => {
    if (activeTab !== "items") return;
    if (!address) {
      setItems([]);
      return;
    }

    let isMounted = true;

    async function loadItems() {
      setIsLoading(true);
      setItemsError(null);
      try {
        const response = await fetch(
          `/api/opensea/account?address=${address}&chainId=${chainId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load wallet NFTs.");
        }
        const data = (await response.json()) as { nfts: NftGalleryItem[] };
        if (isMounted) {
          setItems(data.nfts ?? []);
          setPage(1);
        }
      } catch (error) {
        if (isMounted) {
          setItemsError(
            error instanceof Error ? error.message : "Failed to load items.",
          );
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [activeTab, address, chainId]);

  useEffect(() => {
    if (activeTab !== "listings") return;
    if (!address) {
      setListings([]);
      return;
    }

    let isMounted = true;

    async function loadListings() {
      setIsListingsLoading(true);
      setListingsError(null);
      try {
        const response = await fetch(
          `/api/opensea/listings?address=${address}&chainId=${chainId}&limit=50`,
        );
        if (!response.ok) {
          throw new Error("Failed to load listings.");
        }
        const data = (await response.json()) as { listings: NftGalleryItem[] };
        if (isMounted) {
          setListings(data.listings ?? []);
          setListingsPage(1);
        }
      } catch (error) {
        if (isMounted) {
          setListingsError(
            error instanceof Error ? error.message : "Failed to load listings.",
          );
          setListings([]);
        }
      } finally {
        if (isMounted) {
          setIsListingsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [activeTab, address, chainId]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  const listingsTotalPages = Math.max(1, Math.ceil(listings.length / pageSize));
  const pageListings = listings.slice(
    (listingsPage - 1) * pageSize,
    listingsPage * pageSize,
  );

  return (
    <div className="px-0 pb-24  text-slate-100">
      <div className="mt-6 space-y-3">
        <div className="overflow-hidden">
          <div className="relative h-28 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.2),_transparent_55%)]" />
          <div className="-mt-10 flex flex-col gap-3 px-6 pb-6">
            <div className="h-20 w-20 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-lg">
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="mt-2 text-2xl font-semibold">{displayName}</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                @{username}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {isConnected && address
                  ? truncateAddress(address)
                  : "Not connected"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {networkLabel}
              </span>
            </div>
          </div>
        </div>

        <div className=" border border-white/10 bg-slate-900/60 p-4 text-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.4)]">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border px-4 py-2 transition ${
                  activeTab === tab
                    ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-300/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl  text-sm text-slate-300">
            {activeTab === "items" ? (
              <div className="space-y-3">
                {itemsError ? (
                  <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs font-semibold uppercase tracking-wide text-rose-200">
                    {itemsError}
                  </div>
                ) : null}
                <NFTGalleryContainer items={pageItems} isLoading={isLoading} />
                {items.length > pageSize ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      const isActive = pageNumber === page;
                      const isEdge =
                        pageNumber === 1 || pageNumber === totalPages;
                      const isNear =
                        Math.abs(pageNumber - page) <= 1 ||
                        (page === 1 && pageNumber <= 3) ||
                        (page === totalPages && pageNumber >= totalPages - 2);
                      if (!isEdge && !isNear) {
                        if (pageNumber === 2 || pageNumber === totalPages - 1) {
                          return (
                            <span
                              key={`ellipsis-${pageNumber}`}
                              className="px-2 text-slate-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                      return (
                        <button
                          key={`page-${pageNumber}`}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className={`rounded-full border px-3 py-2 transition ${
                            isActive
                              ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-300/30"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={page === totalPages}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {activeTab === "listings" ? (
              <div className="space-y-3">
                {listingsError ? (
                  <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs font-semibold uppercase tracking-wide text-rose-200">
                    {listingsError}
                  </div>
                ) : null}
                <NFTGalleryContainer
                  items={pageListings}
                  isLoading={isListingsLoading}
                />
                {listings.length > pageSize ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    <button
                      type="button"
                      onClick={() =>
                        setListingsPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={listingsPage === 1}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {Array.from({ length: listingsTotalPages }).map(
                      (_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === listingsPage;
                        const isEdge =
                          pageNumber === 1 || pageNumber === listingsTotalPages;
                        const isNear =
                          Math.abs(pageNumber - listingsPage) <= 1 ||
                          (listingsPage === 1 && pageNumber <= 3) ||
                          (listingsPage === listingsTotalPages &&
                            pageNumber >= listingsTotalPages - 2);
                        if (!isEdge && !isNear) {
                          if (
                            pageNumber === 2 ||
                            pageNumber === listingsTotalPages - 1
                          ) {
                            return (
                              <span
                                key={`listings-ellipsis-${pageNumber}`}
                                className="px-2 text-slate-500"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                        return (
                          <button
                            key={`listings-page-${pageNumber}`}
                            type="button"
                            onClick={() => setListingsPage(pageNumber)}
                            className={`rounded-full border px-3 py-2 transition ${
                              isActive
                                ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100"
                                : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-300/30"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      },
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setListingsPage((prev) =>
                          Math.min(listingsTotalPages, prev + 1),
                        )
                      }
                      disabled={listingsPage === listingsTotalPages}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {activeTab === "offers" ? (
              <p>Track offers made and received across collections.</p>
            ) : null}
            {activeTab === "activity" ? (
              <p>Recent bids, purchases, and sales will show here.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
