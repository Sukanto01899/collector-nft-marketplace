Collector NFT Marketplace
=========================

Farcaster-first NFT marketplace for exploring collections, listing NFTs, and
making offers across Base and other EVM chains. Integrates OpenSea data and
Seaport/OpenSea order flows in a mobile-friendly UI.

Features
--------
- Browse trending collections and search OpenSea data.
- View collection details and NFT grids by chain.
- List NFTs and submit offers with wallet signing.
- Profile view for owned items and listings by selected network.
- Farcaster miniapp manifest + webhook integration.

Local setup
-----------
1) Install dependencies:
   - pnpm install

2) Create `.env.local` with the required values:
   - NEXT_PUBLIC_URL
   - DOMAIN
   - OPENSEA_API_KEY
   - NEXT_PUBLIC_OPENSEA_API_KEY
   - NEXT_PUBLIC_CHAIN_ID
   - NEYNAR_API_KEY
   - NEYNAR_CLIENT_ID
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

3) Start dev server:
   - pnpm dev

Scripts
-------
- pnpm dev
- pnpm build
- pnpm start
- pnpm lint

Notes
-----
- Network switching uses wagmi chains. Ensure your wallet supports the selected
  chain.
- OpenSea indexing may take a few minutes after listing/offer submission.
