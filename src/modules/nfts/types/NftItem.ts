export interface NftItem {
  address: string;
  collection_address: string;
  index: number;
  init: boolean;
  metadata: {
    name: string;
    description?: string;
    image?: string;
    content_type?: string;
    content_url?: string;
    attributes?: {
      trait_type: string;
      value: string | number;
    }[];
    external_url?: string;
    marketplace?: string;
  };
  owner: {
    address: string;
    icon: string;
    isScam: boolean;
    name: string;
  };
  raw_individual_content: string;
  verified: boolean;
}
