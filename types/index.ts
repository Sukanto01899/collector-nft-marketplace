export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface LeaderProps {
  leader: {
    fid: number;
    address: string;
    earned: number;
    username: string;
    index: number;
    pfp: string;
    invited: number;
  };
}

export interface MarketplaceCollection {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  floorPrice?: number | null;
  totalSupply?: number | null;
  totalVolume?: number | null;
  topOffer?: number | null;
  numOwners?: number | null;
}
