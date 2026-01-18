import { NextResponse } from "next/server";
import { fetchPopularNFTs } from "@/lib/opensea";

export async function GET() {
  try {
    const nfts = await fetchPopularNFTs(20);
    return NextResponse.json({
      nfts: nfts.map((nft) => ({
        id: `${nft.contract}-${nft.identifier}`,
        name: nft.name ?? "Untitled",
        tokenId: nft.identifier,
        contractAddress: nft.contract,
        imageUrl: nft.display_image_url ?? nft.image_url ?? "",
        collection: nft.collection,
        description: nft.description ?? "",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        nfts: [],
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
