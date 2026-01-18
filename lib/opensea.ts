import "server-only";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const OPENSEA_API_KEY = requireEnv("OPENSEA_API_KEY");

export interface OpenSeaNft {
  identifier: string;
  contract: string;
  collection: string;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  display_image_url?: string | null;
  metadata_url?: string | null;
  opensea_url?: string | null;
}

export interface OpenSeaAccountNftsResponse {
  nfts: OpenSeaNft[];
  next?: string | null;
}

export interface OpenSeaNftPrice {
  price: string;
  currency: string;
  rawPrice: string;
  decimals: number;
  order?: OpenSeaListingOrder;
}

type OpenSeaCollection = {
  slug?: string;
  collection?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  banner_image_url?: string | null;
  floor_price?: number | null;
  stats?: {
    floor_price?: number | null;
    total_supply?: number | null;
  };
};

type OpenSeaCollectionDetailed = {
  collection: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  banner_image_url?: string | null;
  total_supply?: number | null;
  contracts?: Array<{
    address: string;
    chain: string;
  }>;
};

type OpenSeaCollectionStats = {
  floor_price?: number | null;
  total_supply?: number | null;
  total_volume?: number | null;
  num_owners?: number | null;
  top_offer?: number | null;
};

type OpenSeaCollectionStatsResponse = {
  total?: {
    volume?: number | null;
    floor_price?: number | null;
    num_owners?: number | null;
  };
};

type OpenSeaListingOrder = {
  order_hash?: string;
  maker?: string;
  current_price?: string;
  payment_token?: {
    symbol?: string;
    decimals?: number;
  };
  protocol_data?: {
    parameters?: {
      offer?: Array<{
        token?: string;
        identifierOrCriteria?: string;
      }>;
    };
  };
};

export function mapChainIdToOpenSeaChain(chainId?: number) {
  switch (chainId) {
    case 1:
      return "ethereum";
    case 10:
      return "optimism";
    case 137:
      return "polygon";
    case 42161:
      return "arbitrum";
    case 42220:
      return "celo";
    case 8453:
      return "base";
    case 84532:
      return "base-sepolia";
    default:
      return "base";
  }
}

function getOpenSeaChain() {
  const chainOverride = process.env.OPENSEA_CHAIN;
  if (chainOverride) return chainOverride;

  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ?? process.env.CHAIN_ID;
  return mapChainIdToOpenSeaChain(chainId ? Number(chainId) : undefined);
}

const OPENSEA_TIMEOUT_MS = 12000;
const OPENSEA_RETRY_STATUS = new Set([408, 429, 500, 502, 503, 504, 522, 524]);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function openseaFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  const url = new URL(`${OPENSEA_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENSEA_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-API-KEY": OPENSEA_API_KEY,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        const message =
          response.status === 522
            ? "OpenSea API timed out (522). Try again shortly."
            : `OpenSea API error ${response.status}: ${text}`;
        if (OPENSEA_RETRY_STATUS.has(response.status) && attempt === 0) {
          await delay(450);
          continue;
        }
        throw new Error(message);
      }

      return (await response.json()) as T;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OpenSea API request failed.";
      lastError = new Error(message);
      if (attempt === 0 && !message.includes("OpenSea API error")) {
        await delay(450);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("OpenSea API request failed.");
}

function formatUnits(rawValue: string, decimals: number) {
  const value = BigInt(rawValue);
  const base = BigInt(10) ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === BigInt(0)) return whole.toString();
  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
}

export async function fetchUserNFTs(address: string) {
  const chain = getOpenSeaChain();
  return openseaFetch<OpenSeaAccountNftsResponse>(
    `/chain/${chain}/account/${address}/nfts`,
    {
      include_metadata: true,
      limit: 50,
    },
  );
}

export async function fetchUserNFTsForChain(
  address: string,
  chainId?: number,
) {
  const chain = mapChainIdToOpenSeaChain(chainId);
  return openseaFetch<OpenSeaAccountNftsResponse>(
    `/chain/${chain}/account/${address}/nfts`,
    {
      include_metadata: true,
      limit: 50,
    },
  );
}

export async function fetchUserListingsForChain(
  address: string,
  chainId?: number,
  limit = 10,
) {
  const chain = mapChainIdToOpenSeaChain(chainId);
  return openseaFetch<{ orders?: OpenSeaListingOrder[] }>(
    `/orders/${chain}/seaport/listings`,
    {
      maker: address,
      limit,
      order_by: "created_date",
      order_direction: "desc",
    },
  );
}

export async function fetchNFTPrice(
  contractAddress: string,
  tokenId: string | number,
  chainOverride?: string,
): Promise<OpenSeaNftPrice | null> {
  const chain = chainOverride ?? getOpenSeaChain();
  const data = await openseaFetch<{
    orders?: Array<{
      current_price?: string;
      payment_token?: {
        symbol?: string;
        decimals?: number;
      };
    }>;
  }>(`/orders/${chain}/seaport/listings`, {
    asset_contract_address: contractAddress,
    token_ids: tokenId,
    limit: 1,
    order_by: "eth_price",
    order_direction: "asc",
  });

  const order = data.orders?.[0];
  const rawPrice = order?.current_price;
  if (!rawPrice) return null;

  const decimals = Number(order?.payment_token?.decimals ?? 18);
  const currency = order?.payment_token?.symbol ?? "ETH";

  return {
    price: formatUnits(rawPrice, decimals),
    currency,
    rawPrice,
    decimals,
    order,
  };
}

export async function fetchTrendingCollections(limit = 20, chainId?: number) {
  const chain = chainId ? mapChainIdToOpenSeaChain(chainId) : getOpenSeaChain();
  const collections = await openseaFetch<{ collections?: OpenSeaCollection[] }>(
    "/collections",
    {
      chain,
      limit: Math.min(limit, 30),
      order_by: "seven_day_volume",
    },
  );

  return collections.collections ?? [];
}

export async function fetchCollectionsBySearch(
  query: string,
  limit = 20,
  chainId?: number,
) {
  const chain = chainId ? mapChainIdToOpenSeaChain(chainId) : getOpenSeaChain();
  const collections = await openseaFetch<{ collections?: OpenSeaCollection[] }>(
    "/collections",
    {
      chain,
      search: query,
      limit: Math.min(limit, 30),
    },
  );

  return collections.collections ?? [];
}

export async function fetchCollection(slug: string) {
  const safeSlug = encodeURIComponent(slug);
  const data = await openseaFetch<OpenSeaCollectionDetailed>(
    `/collections/${safeSlug}`,
  );
  return data ?? null;
}

export async function fetchCollectionStats(slug: string) {
  const safeSlug = encodeURIComponent(slug);
  const data = await openseaFetch<OpenSeaCollectionStatsResponse>(
    `/collections/${safeSlug}/stats`,
  );

  if (!data?.total) return null;

  return {
    floor_price:
      typeof data.total.floor_price === "number"
        ? data.total.floor_price
        : null,
    total_volume:
      typeof data.total.volume === "number" ? data.total.volume : null,
    num_owners:
      typeof data.total.num_owners === "number" ? data.total.num_owners : null,
    top_offer: null,
    total_supply: null,
  };
}

export async function fetchCollectionNFTs(slug: string, limit = 20) {
  const safeSlug = encodeURIComponent(slug);
  const data = await openseaFetch<OpenSeaAccountNftsResponse>(
    `/collection/${safeSlug}/nfts`,
    {
      limit,
    },
  );
  return data.nfts ?? [];
}

export async function fetchPopularNFTs(limit = 12) {
  const chain = getOpenSeaChain();
  const collections = await openseaFetch<{ collections?: OpenSeaCollection[] }>(
    "/collections",
    {
      chain,
      limit: Math.min(limit, 24),
      order_by: "seven_day_volume",
    },
  );

  const results: OpenSeaNft[] = [];
  for (const collection of collections.collections ?? []) {
    const slug = collection.slug ?? collection.collection;
    if (!slug) continue;
    try {
      const nfts = await openseaFetch<OpenSeaAccountNftsResponse>(
        `/collection/${slug}/nfts`,
        {
          limit: 1,
        },
      );
      if (nfts.nfts?.[0]) {
        results.push(nfts.nfts[0]);
      }
      if (results.length >= limit) break;
    } catch {
      continue;
    }
  }

  return results;
}
