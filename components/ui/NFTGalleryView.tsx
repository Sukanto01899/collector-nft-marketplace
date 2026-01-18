"use client";

import Modal from "@/components/common/Modal";
import Toast from "@/components/common/Toast";

export type NftGalleryItem = {
  id: string;
  name: string;
  tokenId: string;
  contractAddress: string;
  imageUrl: string;
  collection?: string;
  description?: string;
  openseaUrl?: string;
  metadata?: Record<string, string>;
  price?: {
    amount: string;
    currency: string;
  };
  listingOrder?: unknown;
  isOwner?: boolean;
  ownerAddress?: string;
};

const statusLabel = (item: NftGalleryItem) =>
  item.price ? "Listed" : "Not Listed";

const skeletonKeys = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
];

export type SellStatus =
  | "idle"
  | "validating"
  | "wallet"
  | "listing"
  | "success"
  | "error";

export type BuyStatus = "idle" | "confirm" | "wallet" | "success" | "error";
export type OfferStatus = "idle" | "checking" | "wallet" | "success" | "error";
export type CancelStatus =
  | "idle"
  | "validating"
  | "wallet"
  | "success"
  | "error";

type ToastState = { message: string; variant: "error" | "success" } | null;

type ModalState<TItem, TStatus> = {
  item: TItem | null;
  status: TStatus;
  error: string | null;
};

export type NftGalleryViewProps = {
  items: NftGalleryItem[];
  isLoading?: boolean;
  showTokenId?: boolean;
  showSell?: boolean;
  showOffer?: boolean;
  showBuy?: boolean;
  showCancel?: boolean;
  listedCount: number;
  isConnected: boolean;
  selected: NftGalleryItem | null;
  onSelect: (item: NftGalleryItem) => void;
  onCloseSelected: () => void;
  onOpenSell: (item: NftGalleryItem) => void;
  onOpenBuy: (item: NftGalleryItem) => void;
  onOpenOffer: (item: NftGalleryItem) => void;
  onOpenCancel: (item: NftGalleryItem) => void;
  sellModal: ModalState<NftGalleryItem, SellStatus> & {
    price: string;
    onPriceChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
  };
  buyModal: ModalState<NftGalleryItem, BuyStatus> & {
    txHash: string | null;
    onSubmit: () => void;
    onClose: () => void;
  };
  offerModal: ModalState<NftGalleryItem, OfferStatus> & {
    amount: string;
    balanceLabel: string;
    onAmountChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
  };
  cancelModal: ModalState<NftGalleryItem, CancelStatus> & {
    onSubmit: () => void;
    onClose: () => void;
  };
  toast: ToastState;
};

export default function NFTGalleryView({
  items,
  isLoading = false,
  showTokenId = true,
  showSell = true,
  showOffer = true,
  showBuy = true,
  showCancel = true,
  listedCount,
  isConnected,
  selected,
  onSelect,
  onCloseSelected,
  onOpenSell,
  onOpenBuy,
  onOpenOffer,
  onOpenCancel,
  sellModal,
  buyModal,
  offerModal,
  cancelModal,
  toast,
}: NftGalleryViewProps) {
  const sellInputId = sellModal.item
    ? `sell-price-${sellModal.item.id}`
    : "sell-price";
  const offerInputId = offerModal.item
    ? `offer-amount-${offerModal.item.id}`
    : "offer-amount";

  return (
    <div className="min-h-screen text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.16),_transparent_55%)]" />

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
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-slate-900/80"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-800">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
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
                  {showTokenId ? (
                    <p className="text-xs text-slate-400">
                      Token #{item.tokenId}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        item.price ? "text-emerald-300" : "text-slate-400"
                      }`}
                    >
                      {statusLabel(item)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.collection ?? "Independent"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
      </div>

      {selected ? (
        <Modal variant="sheet">
          <div className="w-full max-w-md rounded-t-3xl rounded-b-2xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">
                  NFT Detail
                </p>
                <h2 className="text-xl font-semibold">{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={onCloseSelected}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="h-64 w-full object-cover"
              />
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                {showTokenId ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Token
                    </p>
                    <p className="mt-1 font-semibold text-slate-100">
                      #{selected.tokenId}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <p
                    className={`mt-1 font-semibold ${
                      selected.price ? "text-emerald-300" : "text-slate-400"
                    }`}
                  >
                    {statusLabel(selected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Collection
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {selected.collection ?? "Independent"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    OpenSea Price
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {selected.price
                      ? `${selected.price.amount} ${selected.price.currency}`
                      : "Not listed"}
                  </p>
                </div>
              </div>

              {selected.metadata ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Metadata
                  </p>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selected.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-400">{key}</span>
                        <span className="font-semibold text-slate-100">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-300 line-clamp-2">
                {selected.description ??
                  "No description provided. Tap into the details to explore the collection story."}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-wide">
                {showSell ? (
                  <button
                    type="button"
                    onClick={() => onOpenSell(selected)}
                    className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-emerald-200 transition hover:bg-emerald-400/20"
                  >
                    Sell
                  </button>
                ) : null}
                {showBuy ? (
                  selected.price && selected.listingOrder ? (
                    <button
                      type="button"
                      onClick={() => onOpenBuy(selected)}
                      className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                      Buy
                    </button>
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-center text-slate-500">
                      Not listed
                    </div>
                  )
                ) : null}
                {showOffer ? (
                  <button
                    type="button"
                    onClick={() => onOpenOffer(selected)}
                    className="rounded-xl border border-slate-500/40 bg-slate-500/10 px-3 py-2 text-slate-200 transition hover:bg-slate-500/20"
                  >
                    Make Offer
                  </button>
                ) : null}
                {showCancel &&
                selected.isOwner &&
                selected.listingOrder ? (
                  <button
                    type="button"
                    onClick={() => onOpenCancel(selected)}
                    className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-rose-200 transition hover:bg-rose-400/20"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}

      {sellModal.item ? (
        <Modal variant="sheet">
          <div className="w-full max-w-md rounded-t-3xl rounded-b-2xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">
                  Sell NFT
                </p>
                <h2 className="text-xl font-semibold">{sellModal.item.name}</h2>
              </div>
              <button
                type="button"
                onClick={sellModal.onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={sellModal.item.imageUrl}
                alt={sellModal.item.name}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <label
                htmlFor={sellInputId}
                className="block text-xs uppercase tracking-wider text-slate-400"
              >
                Listing Price
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <input
                  id={sellInputId}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.0001"
                  placeholder="0.00"
                  value={sellModal.price}
                  onChange={(event) =>
                    sellModal.onPriceChange(event.target.value)
                  }
                  className="w-full bg-transparent text-base font-semibold text-slate-100 outline-none"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ETH
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Validate ownership</span>
                    <span
                      className={`font-semibold ${
                        sellModal.status === "validating" ||
                        sellModal.status === "wallet" ||
                        sellModal.status === "listing" ||
                        sellModal.status === "success"
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    >
                      {sellModal.status === "validating"
                        ? "In progress"
                        : sellModal.status === "idle"
                          ? "Pending"
                          : "Done"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wallet approval & signature</span>
                    <span
                      className={`font-semibold ${
                        sellModal.status === "wallet" ||
                        sellModal.status === "listing" ||
                        sellModal.status === "success"
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    >
                      {sellModal.status === "wallet"
                        ? "Waiting"
                        : sellModal.status === "listing" ||
                            sellModal.status === "success"
                          ? "Done"
                          : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Create listing</span>
                    <span
                      className={`font-semibold ${
                        sellModal.status === "listing" ||
                        sellModal.status === "success"
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    >
                      {sellModal.status === "listing"
                        ? "Submitting"
                        : sellModal.status === "success"
                          ? "Submitted"
                          : "Pending"}
                    </span>
                  </div>
                  {sellModal.status === "success" ? (
                    <p className="text-[11px] text-emerald-200">
                      Listing submitted. OpenSea may take a few minutes to index
                      it.
                    </p>
                  ) : null}
                  {sellModal.status === "error" && sellModal.error ? (
                    <p className="text-[11px] text-rose-200">
                      {sellModal.error}
                    </p>
                  ) : null}
                </div>
              </div>

              {sellModal.status === "success" ? null : (
                <button
                  type="button"
                  onClick={sellModal.onSubmit}
                  disabled={
                    sellModal.status === "wallet" ||
                    sellModal.status === "listing"
                  }
                  className="w-full rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sellModal.status === "wallet" || sellModal.status === "listing"
                    ? "Waiting for wallet"
                    : "Create listing"}
                </button>
              )}
              {!isConnected ? (
                <p className="text-center text-[11px] text-slate-400">
                  Connect your wallet to continue.
                </p>
              ) : sellModal.status === "wallet" ? (
                <p className="text-center text-[11px] text-slate-400">
                  Check your wallet to approve the listing.
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {offerModal.item ? (
        <Modal variant="sheet">
          <div className="w-full max-w-md rounded-t-3xl rounded-b-2xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                  Make Offer
                </p>
                <h2 className="text-xl font-semibold">
                  {offerModal.item.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={offerModal.onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={offerModal.item.imageUrl}
                alt={offerModal.item.name}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <label
                htmlFor={offerInputId}
                className="block text-xs uppercase tracking-wider text-slate-400"
              >
                Offer Amount (WETH)
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <input
                  id={offerInputId}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.0001"
                  placeholder="0.00"
                  value={offerModal.amount}
                  onChange={(event) =>
                    offerModal.onAmountChange(event.target.value)
                  }
                  className="w-full bg-transparent text-base font-semibold text-slate-100 outline-none"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  WETH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Balance: {offerModal.balanceLabel}
              </p>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Check WETH balance</span>
                    <span
                      className={`font-semibold ${
                        offerModal.status === "checking" ||
                        offerModal.status === "wallet" ||
                        offerModal.status === "success"
                          ? "text-amber-200"
                          : "text-slate-500"
                      }`}
                    >
                      {offerModal.status === "checking"
                        ? "In progress"
                        : offerModal.status === "idle"
                          ? "Pending"
                          : "Done"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wallet signature</span>
                    <span
                      className={`font-semibold ${
                        offerModal.status === "wallet" ||
                        offerModal.status === "success"
                          ? "text-amber-200"
                          : "text-slate-500"
                      }`}
                    >
                      {offerModal.status === "wallet"
                        ? "Waiting"
                        : offerModal.status === "success"
                          ? "Done"
                          : "Pending"}
                    </span>
                  </div>
                  {offerModal.status === "success" ? (
                    <p className="text-[11px] text-amber-200">
                      Offer submitted. OpenSea will index it shortly.
                    </p>
                  ) : null}
                  {offerModal.status === "error" && offerModal.error ? (
                    <p className="text-[11px] text-rose-200">
                      {offerModal.error}
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={offerModal.onSubmit}
                disabled={offerModal.status === "wallet"}
                className="w-full rounded-2xl border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {offerModal.status === "wallet"
                  ? "Waiting for wallet"
                  : "Submit offer"}
              </button>
              {!isConnected ? (
                <p className="text-center text-[11px] text-slate-400">
                  Connect your wallet to continue.
                </p>
              ) : offerModal.status === "wallet" ? (
                <p className="text-center text-[11px] text-slate-400">
                  Check your wallet to sign the offer.
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {cancelModal.item ? (
        <Modal variant="sheet">
          <div className="w-full max-w-md rounded-t-3xl rounded-b-2xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-rose-200/70">
                  Cancel Listing
                </p>
                <h2 className="text-xl font-semibold">
                  {cancelModal.item.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={cancelModal.onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={cancelModal.item.imageUrl}
                alt={cancelModal.item.name}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Validate creator</span>
                    <span
                      className={`font-semibold ${
                        cancelModal.status === "validating" ||
                        cancelModal.status === "wallet" ||
                        cancelModal.status === "success"
                          ? "text-rose-200"
                          : "text-slate-500"
                      }`}
                    >
                      {cancelModal.status === "validating"
                        ? "In progress"
                        : cancelModal.status === "idle"
                          ? "Pending"
                          : "Done"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wallet signature</span>
                    <span
                      className={`font-semibold ${
                        cancelModal.status === "wallet" ||
                        cancelModal.status === "success"
                          ? "text-rose-200"
                          : "text-slate-500"
                      }`}
                    >
                      {cancelModal.status === "wallet"
                        ? "Waiting"
                        : cancelModal.status === "success"
                          ? "Done"
                          : "Pending"}
                    </span>
                  </div>
                  {cancelModal.status === "success" ? (
                    <p className="text-[11px] text-rose-200">
                      Listing canceled. OpenSea will update shortly.
                    </p>
                  ) : null}
                  {cancelModal.status === "error" && cancelModal.error ? (
                    <p className="text-[11px] text-rose-200">
                      {cancelModal.error}
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={cancelModal.onSubmit}
                disabled={cancelModal.status === "wallet"}
                className="w-full rounded-2xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelModal.status === "wallet"
                  ? "Waiting for wallet"
                  : "Cancel listing"}
              </button>
              {cancelModal.status === "error" && cancelModal.item?.openseaUrl ? (
                <button
                  type="button"
                  onClick={() => window.open(cancelModal.item?.openseaUrl, "_blank")}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
                >
                  Open on OpenSea
                </button>
              ) : null}
              {!isConnected ? (
                <p className="text-center text-[11px] text-slate-400">
                  Connect your wallet to continue.
                </p>
              ) : cancelModal.status === "wallet" ? (
                <p className="text-center text-[11px] text-slate-400">
                  Check your wallet to confirm the cancel.
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {buyModal.item ? (
        <Modal variant="sheet">
          <div className="w-full max-w-md rounded-t-3xl rounded-b-2xl border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">
                  Buy NFT
                </p>
                <h2 className="text-xl font-semibold">{buyModal.item.name}</h2>
              </div>
              <button
                type="button"
                onClick={buyModal.onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={buyModal.item.imageUrl}
                alt={buyModal.item.name}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Confirm Price
                </p>
                <p className="mt-2 text-base font-semibold text-slate-100">
                  {buyModal.item.price
                    ? `${buyModal.item.price.amount} ${buyModal.item.price.currency}`
                    : "Not listed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Confirm price</span>
                    <span
                      className={`font-semibold ${
                        buyModal.status === "confirm" ||
                        buyModal.status === "wallet" ||
                        buyModal.status === "success"
                          ? "text-cyan-200"
                          : "text-slate-500"
                      }`}
                    >
                      {buyModal.status === "confirm"
                        ? "In progress"
                        : buyModal.status === "idle"
                          ? "Pending"
                          : "Done"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wallet signature</span>
                    <span
                      className={`font-semibold ${
                        buyModal.status === "wallet" ||
                        buyModal.status === "success"
                          ? "text-cyan-200"
                          : "text-slate-500"
                      }`}
                    >
                      {buyModal.status === "wallet"
                        ? "Waiting"
                        : buyModal.status === "success"
                          ? "Done"
                          : "Pending"}
                    </span>
                  </div>
                  {buyModal.status === "success" ? (
                    <p className="text-[11px] text-cyan-200">
                      Purchase submitted successfully.
                    </p>
                  ) : null}
                  {buyModal.txHash ? (
                    <p className="break-all text-[11px] text-slate-300">
                      Tx: {buyModal.txHash}
                    </p>
                  ) : null}
                  {buyModal.status === "error" && buyModal.error ? (
                    <p className="text-[11px] text-rose-200">
                      {buyModal.error}
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={buyModal.onSubmit}
                disabled={buyModal.status === "wallet"}
                className="w-full rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buyModal.status === "wallet"
                  ? "Waiting for wallet"
                  : "Buy now"}
              </button>
              {!isConnected ? (
                <p className="text-center text-[11px] text-slate-400">
                  Connect your wallet to continue.
                </p>
              ) : buyModal.status === "wallet" ? (
                <p className="text-center text-[11px] text-slate-400">
                  Check your wallet to confirm the purchase.
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {toast ? <Toast message={toast.message} variant={toast.variant} /> : null}
    </div>
  );
}
