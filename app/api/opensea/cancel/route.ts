import { NextResponse } from "next/server";
import { mapChainIdToOpenSeaChain } from "@/lib/opensea";

type CancelRequest = {
  chain?: string;
  chainId?: number;
  protocolAddress: string;
  orderHash: string;
  offererSignature: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CancelRequest;
    const chain =
      body.chain ??
      (typeof body.chainId === "number"
        ? mapChainIdToOpenSeaChain(body.chainId)
        : null);

    if (!chain) {
      return NextResponse.json(
        { error: "Missing chain or chainId." },
        { status: 400 },
      );
    }

    if (!body.protocolAddress || !body.orderHash || !body.offererSignature) {
      return NextResponse.json(
        { error: "Missing protocolAddress, orderHash, or offererSignature." },
        { status: 400 },
      );
    }

    const url = `https://api.opensea.io/api/v2/orders/chain/${chain}/protocol/${body.protocolAddress}/${body.orderHash}/cancel`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": process.env.OPENSEA_API_KEY ?? "",
      },
      body: JSON.stringify({ offererSignature: body.offererSignature }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: `OpenSea cancel failed (${response.status}): ${text}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "OpenSea error",
      },
      { status: 500 },
    );
  }
}
