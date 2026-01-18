export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const APP_URL = process.env.NEXT_PUBLIC_URL;

if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL or NEXT_PUBLIC_VERCEL_URL is not set");
}

export const APP_NAME = "Collector";
export const APP_DESCRIPTION =
  "Collector is a NFT marketplace to explore collections, list NFTs, and make offers across Base and major EVM chains.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Open Marketplace";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0B1220";
export const APP_PRIMARY_CATEGORY = "art-creativity";
export const APP_TAGS = ["art", "nft", "marketplace", "base", "opensea"];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJjb2xsZWN0b3ItbmZ0LnZlcmNlbC5hcHAifQ",
  signature:
    "F1R1PwkH5aoYcSJp6YbH0AmHeoP0rzaIut2lOu1fYGw2BkG+9iAOcnQToo+VBAOeh4ymkGP6oFTp5fhp0+ZjCBs=",
};

export const notificationsBtn = [
  {
    id: 1,
    name: "Score Check",
    title: "🎉 Check you Neyner score today.",
    body: "Open Farstate Ai & Check your Neyner score!",
  },
  {
    id: 2,
    name: "Daily Cast",
    title: "🏆 Make cast with Ai today!",
    body: "Generate cast wih Ai and Cast it instant  🥇!",
  },
  {
    id: 3,
    name: "Increase score?",
    title: "How to increase Neyner score?",
    body: "FCFS giveaway started. Open app and claim now ⚡!",
  },
  {
    id: 4,
    name: "Rewards",
    title: "💰 Claim DEGEN Drop now!",
    body: "DEGEN Exclusive drop claiming started (FCFS)⚡!",
  },
  {
    id: 5,
    name: "Rewards",
    title: "💰 Did you claim your DEGEN Today?",
    body: "Keep your streak going strong, check-in now⚡!",
  },
];
