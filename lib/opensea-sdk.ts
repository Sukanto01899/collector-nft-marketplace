import { BrowserProvider } from "ethers";
import { Chain, OpenSeaSDK } from "opensea-js";
import { getSeaportVersion } from "opensea-js/lib/utils/protocol";
import type { WalletClient } from "viem";

const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;

if (!OPENSEA_API_KEY) {
  throw new Error("NEXT_PUBLIC_OPENSEA_API_KEY is not set");
}

type OpenSeaSdkInstance = InstanceType<typeof OpenSeaSDK>;
type CreateListingParams = Parameters<OpenSeaSdkInstance["createListing"]>[0];
type FulfillOrderParams = Parameters<OpenSeaSdkInstance["fulfillOrder"]>[0];
type CreateOfferParams = Parameters<OpenSeaSdkInstance["createOffer"]>[0];
type CancelOrderParams = Parameters<OpenSeaSdkInstance["cancelOrder"]>[0];
type OffchainCancelParams = {
  orderHash: string;
  protocolAddress: string;
};

type SignOrderHashParams = {
  orderHash: string;
  protocolAddress: string;
  chainId?: number;
};

function mapChainIdToOpenSea(chainId?: number): Chain {
  switch (chainId) {
    case 1:
      return Chain.Mainnet;
    case 8453:
      return Chain.Base;
    case 84532:
      return Chain.Base;
    case 10:
      return Chain.Optimism;
    case 137:
      return Chain.Polygon;
    case 42161:
      return Chain.Arbitrum;
    default:
      return Chain.Base;
  }
}

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function toEip1193Provider(walletClient: WalletClient): Eip1193Provider {
  return {
    request: walletClient.request.bind(walletClient) as Eip1193Provider["request"],
  };
}

async function getOpenSeaSdk(walletClient: WalletClient) {
  const chain = mapChainIdToOpenSea(walletClient.chain?.id);
  const provider = new BrowserProvider(toEip1193Provider(walletClient) as never);
  const signer = await provider.getSigner();

  return new OpenSeaSDK(signer as never, {
    chain,
    apiKey: OPENSEA_API_KEY,
  });
}

export async function createListing(
  walletClient: WalletClient,
  params: CreateListingParams,
) {
  const sdk = await getOpenSeaSdk(walletClient);
  return sdk.createListing(params);
}

export async function fulfillListing(
  walletClient: WalletClient,
  params: FulfillOrderParams,
) {
  const sdk = await getOpenSeaSdk(walletClient);
  return sdk.fulfillOrder(params);
}

export async function createOffer(
  walletClient: WalletClient,
  params: CreateOfferParams,
) {
  const sdk = await getOpenSeaSdk(walletClient);
  return sdk.createOffer(params);
}

export async function cancelOrder(
  walletClient: WalletClient,
  params: CancelOrderParams,
) {
  const sdk = await getOpenSeaSdk(walletClient);
  return sdk.cancelOrder(params);
}

export async function offchainCancelOrder(
  walletClient: WalletClient,
  params: OffchainCancelParams,
) {
  const sdk = await getOpenSeaSdk(walletClient);
  return sdk.offchainCancelOrder(
    params.protocolAddress,
    params.orderHash,
    undefined,
    undefined,
    true,
  );
}

export async function signOrderHash(
  walletClient: WalletClient,
  params: SignOrderHashParams,
) {
  const provider = new BrowserProvider(
    toEip1193Provider(walletClient) as never,
  );
  const signer = await provider.getSigner();
  const chainId =
    params.chainId ??
    (typeof walletClient.chain?.id === "number"
      ? walletClient.chain.id
      : Number((await provider.getNetwork()).chainId));
  const version = getSeaportVersion(params.protocolAddress);
  return signer.signTypedData(
    {
      name: "Seaport",
      version,
      chainId,
      verifyingContract: params.protocolAddress,
    },
    {
      OrderHash: [{ name: "orderHash", type: "bytes32" }],
    },
    { orderHash: params.orderHash },
  );
}
