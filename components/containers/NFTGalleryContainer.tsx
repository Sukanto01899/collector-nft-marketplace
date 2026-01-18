"use client";

import { useMemo, useRef, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import type { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import {
  cancelOrder,
  fulfillOrder,
  getWethAddress,
} from "@/lib/seaport-marketplace";
import {
  createListing as createOpenSeaListing,
  createOffer as createOpenSeaOffer,
} from "@/lib/opensea-sdk";
import NFTGalleryView, {
  type BuyStatus,
  type CancelStatus,
  type NftGalleryItem,
  type OfferStatus,
  type SellStatus,
} from "@/components/ui/NFTGalleryView";

export default function NFTGalleryContainer({
  items,
  isLoading = false,
  onRefresh,
  viewOptions,
}: {
  items: NftGalleryItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  viewOptions?: {
    showTokenId?: boolean;
    showSell?: boolean;
    showOffer?: boolean;
    showBuy?: boolean;
    showCancel?: boolean;
  };
}) {
  const normalizeSeaportOrder = (
    order: unknown,
    requireSignature = true,
  ): OrderWithCounter | null => {
    if (!order || typeof order !== "object") return null;
    const orderData = order as {
      protocol_data?: {
        parameters?: OrderWithCounter["parameters"] & { counter?: string };
        signature?: string;
        counter?: string;
      };
      parameters?: OrderWithCounter["parameters"] & { counter?: string };
      signature?: string;
      counter?: string;
    };
    const parameters =
      orderData.protocol_data?.parameters ?? orderData.parameters ?? null;
    const signature =
      orderData.protocol_data?.signature ?? orderData.signature ?? "";
    if (!parameters || (requireSignature && !signature)) return null;

    if (!("counter" in parameters) || parameters.counter === undefined) {
      const counter =
        orderData.protocol_data?.counter ??
        orderData.counter ??
        (parameters as { counter?: string }).counter ??
        "0";
      (parameters as { counter: string }).counter = String(counter);
    }

    return { parameters: parameters as OrderWithCounter["parameters"], signature };
  };
  const [selected, setSelected] = useState<NftGalleryItem | null>(null);
  const [sellItem, setSellItem] = useState<NftGalleryItem | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [sellStatus, setSellStatus] = useState<SellStatus>("idle");
  const [sellError, setSellError] = useState<string | null>(null);
  const [buyItem, setBuyItem] = useState<NftGalleryItem | null>(null);
  const [buyStatus, setBuyStatus] = useState<BuyStatus>("idle");
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buyTxHash, setBuyTxHash] = useState<string | null>(null);
  const [offerItem, setOfferItem] = useState<NftGalleryItem | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("idle");
  const [offerError, setOfferError] = useState<string | null>(null);
  const [cancelItem, setCancelItem] = useState<NftGalleryItem | null>(null);
  const [cancelStatus, setCancelStatus] = useState<CancelStatus>("idle");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const accountAddress = walletClient?.account?.address ?? address;

  const requireWalletAccount = async () => {
    if (!walletClient) {
      throw new Error("Wallet client not available.");
    }
    if (walletClient.account?.address) {
      return walletClient.account.address;
    }
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Wallet request timed out.")), 10000);
    });
    const accounts = (await Promise.race([
      walletClient.request({ method: "eth_accounts" }),
      timeoutPromise,
    ])) as string[];
    if (Array.isArray(accounts) && accounts.length > 0) {
      return accounts[0];
    }
    const requested = (await Promise.race([
      walletClient.request({ method: "eth_requestAccounts" }),
      timeoutPromise,
    ])) as string[];
    if (Array.isArray(requested) && requested.length > 0) {
      return requested[0];
    }
    throw new Error("Wallet is not ready for signing.");
  };

  const wethAddress = useMemo(
    () => getWethAddress(walletClient?.chain?.id) ?? null,
    [walletClient?.chain?.id],
  );

  const { data: wethBalance, isLoading: isWethBalanceLoading } = useBalance({
    address,
    token: wethAddress ?? undefined,
    chainId: walletClient?.chain?.id,
    query: {
      enabled: Boolean(address && wethAddress),
    },
  });

  const listedCount = useMemo(
    () => items.filter((item) => item.price).length,
    [items],
  );

  const showToast = (message: string, variant: "error" | "success" = "error") => {
    setToast({ message, variant });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  const openSell = (item: NftGalleryItem) => {
    setSellItem(item);
    setSellPrice(item.price?.amount ?? "");
    setSellStatus("idle");
    setSellError(null);
  };

  const openBuy = (item: NftGalleryItem) => {
    setBuyItem(item);
    setBuyStatus("confirm");
    setBuyError(null);
    setBuyTxHash(null);
  };

  const openOffer = (item: NftGalleryItem) => {
    setOfferItem(item);
    setOfferAmount("");
    setOfferStatus("checking");
    setOfferError(null);
  };

  const openCancel = (item: NftGalleryItem) => {
    if (!item.listingOrder) {
      showToast("Listing data missing for this item.");
      return;
    }
    if (item.isOwner === false) {
      showToast("Only the creator can cancel this listing.");
      return;
    }
    setCancelItem(item);
    setCancelStatus("idle");
    setCancelError(null);
  };

  const closeSellModal = () => {
    setSellItem(null);
    setSellPrice("");
    setSellStatus("idle");
    setSellError(null);
  };

  const closeBuyModal = () => {
    setBuyItem(null);
    setBuyStatus("idle");
    setBuyError(null);
    setBuyTxHash(null);
  };

  const closeOfferModal = () => {
    setOfferItem(null);
    setOfferAmount("");
    setOfferStatus("idle");
    setOfferError(null);
  };

  const closeCancelModal = () => {
    setCancelItem(null);
    setCancelStatus("idle");
    setCancelError(null);
  };

  const handleSellSubmit = async () => {
    if (!sellItem) return;
    if (sellStatus === "wallet" || sellStatus === "listing" || sellStatus === "success") {
      return;
    }
    setSellError(null);
    setSellStatus("validating");

    if (!accountAddress) {
      const message = "Connect your wallet to create a listing.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
      return;
    }

    if (sellItem.isOwner === false) {
      const message = "Only the owner can create a listing.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
      return;
    }

    if (
      sellItem.ownerAddress &&
      accountAddress &&
      sellItem.ownerAddress.toLowerCase() !== accountAddress.toLowerCase()
    ) {
      const message = "Wallet does not match the NFT owner.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
      return;
    }

    const priceValue = Number(sellPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      const message = "Enter a valid price greater than 0.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
      return;
    }

    if (!walletClient) {
      const message = "Wallet client not available.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
      return;
    }

    try {
      setSellStatus("wallet");
      await createOpenSeaListing(walletClient, {
        asset: {
          tokenId: sellItem.tokenId,
          tokenAddress: sellItem.contractAddress,
        },
        accountAddress,
        startAmount: sellPrice,
      });
      setSellStatus("listing");
      setTimeout(() => setSellStatus("success"), 400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create listing.";
      setSellStatus("error");
      setSellError(message);
      showToast(message);
    }
  };

  const handleOfferSubmit = async () => {
    if (!offerItem) return;
    setOfferError(null);

    if (!accountAddress) {
      const message = "Connect your wallet to make an offer.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    if (!walletClient) {
      const message = "Wallet client not available.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    if (!wethAddress) {
      const message = "WETH is not supported on this network.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    const amountValue = Number(offerAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      const message = "Enter a valid offer amount.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }
    const amountParts = offerAmount.trim().split(".");
    const fractional = amountParts[1] ?? "";
    if (fractional.length > 4) {
      const message = "Offer amount supports up to 4 decimal places.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }
    if (amountValue < 0.0001) {
      const message = "Minimum offer amount is 0.0001 WETH.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    if (isWethBalanceLoading) {
      const message = "WETH balance is still loading.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    const decimals = wethBalance?.decimals ?? 18;
    const amountWei = parseUnits(offerAmount, decimals);
    const balanceWei = wethBalance?.value ?? BigInt(0);
    if (amountWei > balanceWei) {
      const message = "Insufficient WETH balance for this offer.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
      return;
    }

    try {
      setOfferStatus("wallet");
      await createOpenSeaOffer(walletClient, {
        asset: {
          tokenId: offerItem.tokenId,
          tokenAddress: offerItem.contractAddress,
        },
        accountAddress,
        startAmount: offerAmount,
      });
      setOfferStatus("success");
      showToast("Offer submitted.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create offer.";
      setOfferStatus("error");
      setOfferError(message);
      showToast(message);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelItem) return;
    setCancelError(null);
    setCancelStatus("validating");

    if (!accountAddress) {
      const message = "Connect your wallet to cancel the listing.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    if (!walletClient) {
      const message = "Wallet client not available.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    if (!cancelItem.listingOrder) {
      const message = "Listing order data is missing.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    if (cancelItem.isOwner === false) {
      const message = "Only the creator can cancel this listing.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    if (
      cancelItem.ownerAddress &&
      address &&
      cancelItem.ownerAddress.toLowerCase() !== address.toLowerCase()
    ) {
      const message = "Only the creator can cancel this listing.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    const makerValue = (cancelItem.listingOrder as { maker?: unknown }).maker;
    const maker =
      typeof makerValue === "string"
        ? makerValue
        : typeof (makerValue as { address?: unknown } | null)?.address === "string"
          ? (makerValue as { address: string }).address
          : null;
    if (
      maker &&
      accountAddress &&
      maker.toLowerCase() !== accountAddress.toLowerCase()
    ) {
      const message = "Only the creator can cancel this listing.";
      setCancelStatus("error");
      setCancelError(message);
      showToast(message);
      return;
    }

    try {
      await requireWalletAccount();
      setCancelStatus("wallet");
      const order = normalizeSeaportOrder(cancelItem.listingOrder, false);
      if (!order) {
        throw new Error("Listing order data is missing.");
      }
      await cancelOrder(walletClient, {
        order,
        accountAddress: accountAddress,
      });
      setCancelStatus("success");
      onRefresh?.();
      showToast("Listing canceled. Refreshing...", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel listing.";
      const friendly = message.includes("InvalidCanceller")
        ? "Only the creator can cancel this listing."
        : message;
      setCancelStatus("error");
      setCancelError(friendly);
      showToast(friendly);
    }
  };

  const handleBuySubmit = async () => {
    if (!buyItem) return;
    setBuyError(null);
    setBuyTxHash(null);

    if (!accountAddress) {
      const message = "Connect your wallet to buy.";
      setBuyStatus("error");
      setBuyError(message);
      showToast(message);
      return;
    }

    if (!walletClient) {
      const message = "Wallet client not available.";
      setBuyStatus("error");
      setBuyError(message);
      showToast(message);
      return;
    }

    if (!buyItem.price) {
      const message = "This NFT is not listed.";
      setBuyStatus("error");
      setBuyError(message);
      showToast(message);
      return;
    }

    const order = normalizeSeaportOrder(buyItem.listingOrder, true);
    if (!order) {
      const message = "Listing order data is missing.";
      setBuyStatus("error");
      setBuyError(message);
      showToast(message);
      return;
    }

    try {
      setBuyStatus("wallet");
      const result = await fulfillOrder(walletClient, {
        order,
        accountAddress: accountAddress,
      });
      const txHash = (result as { hash?: string }).hash ?? null;
      setBuyTxHash(txHash);
      setBuyStatus("success");
      showToast("Purchase submitted.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to buy listing.";
      setBuyStatus("error");
      setBuyError(message);
      showToast(message);
    }
  };

  const balanceLabel = wethBalance
    ? `${wethBalance.formatted} ${wethBalance.symbol}`
    : "Unavailable";

  return (
    <NFTGalleryView
      items={items}
      isLoading={isLoading}
      showTokenId={viewOptions?.showTokenId}
      showSell={viewOptions?.showSell}
      showOffer={viewOptions?.showOffer}
      showBuy={viewOptions?.showBuy}
      showCancel={viewOptions?.showCancel}
      listedCount={listedCount}
      isConnected={isConnected}
      selected={selected}
      onSelect={setSelected}
      onCloseSelected={() => setSelected(null)}
      onOpenSell={openSell}
      onOpenBuy={openBuy}
      onOpenOffer={openOffer}
      onOpenCancel={openCancel}
      sellModal={{
        item: sellItem,
        status: sellStatus,
        error: sellError,
        price: sellPrice,
        onPriceChange: setSellPrice,
        onSubmit: handleSellSubmit,
        onClose: closeSellModal,
      }}
      buyModal={{
        item: buyItem,
        status: buyStatus,
        error: buyError,
        txHash: buyTxHash,
        onSubmit: handleBuySubmit,
        onClose: closeBuyModal,
      }}
      offerModal={{
        item: offerItem,
        status: offerStatus,
        error: offerError,
        amount: offerAmount,
        balanceLabel,
        onAmountChange: setOfferAmount,
        onSubmit: handleOfferSubmit,
        onClose: closeOfferModal,
      }}
      cancelModal={{
        item: cancelItem,
        status: cancelStatus,
        error: cancelError,
        onSubmit: handleCancelSubmit,
        onClose: closeCancelModal,
      }}
      toast={toast}
    />
  );
}
