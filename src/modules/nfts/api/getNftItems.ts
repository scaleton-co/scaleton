import axios from 'axios';
import { NftItem } from '../types/NftItem';

export async function getNftItems(address: string, network: string): Promise<NftItem[]> {
  const { data: nftItems } = await axios.get('/.netlify/functions/nfts', {
    params: {
      address,
      network,
    },
  });

  return nftItems;
}
