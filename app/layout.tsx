import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collector - NFT Marketplace",
  description:
    "Collector is a NFT marketplace to explore collections, list NFTs, and make offers across Base and major EVM chains.",
  other: {
    "base:app_id": "",
  },
};
const config = {
  rpcUrl: "https://base-rpc.publicnode.com",
  domain: process.env.DOMAIN,
  siweUri: process.env.DOMAIN,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
