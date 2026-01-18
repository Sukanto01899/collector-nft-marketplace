import AppShell from "@/components/common/AppShell";
import MarketplaceTab from "@/components/tabs/MarketplaceTab";
import { APP_URL, APP_SPLASH_BACKGROUND_COLOR } from "@/lib/constants";
import type { Metadata } from "next";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/feed.png`,
  button: {
    title: "Open Marketplace",
    action: {
      type: "launch_frame",
      name: "Collector",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR || "#0B1220",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Collector - NFT Marketplace",
    openGraph: {
      title: "Collector - NFT Marketplace",
      description:
        "Collector is a NFT marketplace to explore collections, list NFTs, and make offers across Base and major EVM chains.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (
    <AppShell>
      <MarketplaceTab />
    </AppShell>
  );
}
