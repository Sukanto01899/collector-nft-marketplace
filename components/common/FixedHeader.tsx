"use client";

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import {
  arbitrum,
  base,
  celo,
  mainnet,
  optimism,
  polygon,
  zora,
} from "wagmi/chains";
import { truncateAddress } from "@/lib/utils";
import Modal from "@/components/common/Modal";

const chainOptions = [
  {
    id: base.id,
    name: "Base Mainnet",
    badge: "BASE",
    badgeClass:
      "bg-gradient-to-br from-sky-400 via-blue-500 to-emerald-300 text-slate-950",
    isDefault: true,
    imageUrl: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
  },
  {
    id: mainnet.id,
    name: "Ethereum",
    badge: "ETH",
    badgeClass: "bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-white",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  },
  {
    id: arbitrum.id,
    name: "Arbitrum",
    badge: "ARB",
    badgeClass:
      "bg-gradient-to-br from-slate-200 via-slate-100 to-sky-300 text-slate-900",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  },
  {
    id: optimism.id,
    name: "Optimism",
    badge: "OP",
    badgeClass: "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
  },

  {
    id: zora.id,
    name: "Zora",
    badge: "ZORA",
    badgeClass: "bg-gradient-to-br from-emerald-300 to-cyan-400 text-slate-900",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/35931.png",
  },
];

const getChainOption = (chainId: number) =>
  chainOptions.find((option) => option.id === chainId) ?? chainOptions[0];

const ChainBadge = ({
  label,
  className,
  imageUrl,
  size = "h-9 w-9",
}: {
  label: string;
  className: string;
  imageUrl?: string;
  size?: string;
}) => (
  <span
    className={`flex ${size} items-center justify-center overflow-hidden rounded-full shadow-[0_10px_20px_rgba(15,23,42,0.45)] ${className}`}
  >
    {imageUrl ? (
      <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
    ) : (
      <span className="sr-only">{label}</span>
    )}
  </span>
);

export default function FixedHeader() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const currentChainId = chainId ?? base.id;
  const currentChain = getChainOption(currentChainId);
  const baseOption = chainOptions[0];
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

  const handleSwitch = (targetChainId: number) => {
    if (!switchChain || currentChainId === targetChainId) return;
    switchChain({ chainId: targetChainId });
    setIsNetworkOpen(false);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur w-full p-3">
      <div className="mx-auto w-full flex justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
          Collector
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300 sm:w-auto sm:justify-end">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            {isConnected && address
              ? `${truncateAddress(address)}`
              : "Not connected"}
          </span>
          <button
            type="button"
            aria-label="Select network"
            onClick={() => setIsNetworkOpen(true)}
            className="rounded-full border border-white/10 bg-white/5 p-1 transition hover:border-emerald-300/40 hover:bg-white/10"
          >
            <ChainBadge
              label={currentChain.name}
              className={currentChain.badgeClass}
              imageUrl={currentChain.imageUrl}
            />
          </button>
        </div>
      </div>
      {isNetworkOpen ? (
        <Modal
          variant="center"
          onClose={() => setIsNetworkOpen(false)}
          closeOnBackdrop
          containerClassName="p-4"
          contentClassName="w-full my-auto animate-sheetUp"
        >
          <div className="mx-auto w-full max-w-none max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
                  Network
                </p>
                <h2 className="text-lg font-semibold">Select chain</h2>
              </div>
            </div>
            <div className="border-b border-white/10 px-4 py-3">
              <button
                type="button"
                disabled={isPending || currentChainId === baseOption.id}
                onClick={() => handleSwitch(baseOption.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                  currentChainId === baseOption.id
                    ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-100"
                    : "border-emerald-300/50 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChainBadge
                    label={baseOption.name}
                    className={baseOption.badgeClass}
                    imageUrl={baseOption.imageUrl}
                    size="h-10 w-10"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Base</p>
                    <p className="text-[10px] uppercase tracking-wide text-emerald-200/80">
                      Default
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300">
                  {currentChainId === baseOption.id ? "Active" : "Switch"}
                </span>
              </button>
            </div>
            <div className="space-y-2 px-4 py-3">
              {chainOptions.map((option) => {
                if (option.id === baseOption.id) return null;
                const isActive = option.id === currentChainId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSwitch(option.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                      isActive
                        ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChainBadge
                        label={option.name}
                        className={option.badgeClass}
                        imageUrl={option.imageUrl}
                        size="h-10 w-10"
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold">{option.name}</p>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] uppercase tracking-widest text-emerald-300">
                        Active
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setIsNetworkOpen(false)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
