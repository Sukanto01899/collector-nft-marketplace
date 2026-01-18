import {
  APP_ACCOUNT_ASSOCIATION,
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
} from "./constants";

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}
export async function getFarcasterDomainManifest() {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION,
    miniapp: {
      version: "1",
      name: APP_NAME ?? "Collector",
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT,
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      description: APP_DESCRIPTION,
      requiredChains: [
        "eip155:8453",
        "eip155:1",
        "eip155:10",
        "eip155:42161",
        "eip155:137",
        "eip155:42220",
        "eip155:7777777",
      ],
      castShareUrl: `${APP_URL}/share`,
    },
    baseBuilder: {
      ownerAddress: "0xB23955A49c9974a40e68717813a108002072a368",
    },
  };
}
export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

export const formatUsdFromEth = (ethValue?: number | null) => {
  if (typeof ethValue !== "number") return null;
  const rate = Number(process.env.NEXT_PUBLIC_ETH_USD ?? "");
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const usdValue = ethValue * rate;
  return usdValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};
