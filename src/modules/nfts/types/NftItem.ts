export interface NftItem {
  address: string;
  index: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  ownerAddress: string | null;
  collectionAddress: string;
  attributes: {
    traitType: string;
    value: string | number;
  }[];
  sale: {
    marketplace: 'get-gems' | 'disintar';
    marketplaceFee: number | null;
    fullPrice: number | null;
    royaltyAmount: number | null;
  } | null;
}
