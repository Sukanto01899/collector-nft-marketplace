import { BrowserProvider, parseEther, parseUnits } from "ethers";
import { Seaport } from "@opensea/seaport-js";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import type { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import type { WalletClient } from "viem";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type OrderParams = {
  tokenAddress: string;
  tokenId: string;
  accountAddress: string;
};

type ListingParams = OrderParams & {
  price: string;
};

type OfferParams = OrderParams & {
  amount: string;
  chainId?: number;
};

type FulfillParams = {
  order: OrderWithCounter;
  accountAddress: string;
};

type CancelParams = {
  order: OrderWithCounter;
  accountAddress: string;
};

const WETH_BY_CHAIN: Record<number, `0x${string}` | undefined> = {
  1: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
  10: "0x4200000000000000000000000000000000000006",
  42161: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  8453: "0x4200000000000000000000000000000000000006",
  84532: "0x4200000000000000000000000000000000000006",
  42220: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
};

function toEip1193Provider(walletClient: WalletClient): Eip1193Provider {
  return {
    request: walletClient.request.bind(walletClient) as Eip1193Provider["request"],
  };
}

async function getSeaport(walletClient: WalletClient) {
  const provider = new BrowserProvider(
    toEip1193Provider(walletClient) as never,
  );
  const signer = await provider.getSigner();
  return new Seaport(signer);
}

export function getWethAddress(chainId?: number) {
  return chainId ? WETH_BY_CHAIN[chainId] : undefined;
}

export async function createListing(
  walletClient: WalletClient,
  params: ListingParams,
) {
  const seaport = await getSeaport(walletClient);
  const { executeAllActions } = await seaport.createOrder(
    {
      offer: [
        {
          itemType: ItemType.ERC721,
          token: params.tokenAddress,
          identifier: params.tokenId,
        },
      ],
      consideration: [
        {
          amount: parseEther(params.price).toString(),
          recipient: params.accountAddress,
        },
      ],
    },
    params.accountAddress,
  );

  return executeAllActions();
}

export async function createOffer(
  walletClient: WalletClient,
  params: OfferParams,
) {
  const seaport = await getSeaport(walletClient);
  const wethAddress = getWethAddress(params.chainId);
  if (!wethAddress) {
    throw new Error("WETH is not supported on this network.");
  }

  const { executeAllActions } = await seaport.createOrder(
    {
      offer: [
        {
          token: wethAddress,
          amount: parseUnits(params.amount, 18).toString(),
        },
      ],
      consideration: [
        {
          itemType: ItemType.ERC721,
          token: params.tokenAddress,
          identifier: params.tokenId,
          recipient: params.accountAddress,
        },
      ],
    },
    params.accountAddress,
  );

  return executeAllActions();
}

export async function fulfillOrder(
  walletClient: WalletClient,
  params: FulfillParams,
) {
  const seaport = await getSeaport(walletClient);
  const { executeAllActions } = await seaport.fulfillOrder({
    order: params.order,
    accountAddress: params.accountAddress,
  });
  return executeAllActions();
}

export async function cancelOrder(
  walletClient: WalletClient,
  params: CancelParams,
) {
  const seaport = await getSeaport(walletClient);
  const txMethods = seaport.cancelOrders(
    [params.order.parameters],
    params.accountAddress,
  );
  return txMethods.transact();
}
