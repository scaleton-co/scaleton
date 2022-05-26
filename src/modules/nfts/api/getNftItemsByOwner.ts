import { NftItem } from '../types/NftItem';
import { scaletonClient } from '../../common';

export async function getNftItemsByOwner(address: string): Promise<NftItem[]> {
  const { data } = await scaletonClient.get(`/v1/accounts/${address}/nfts`);

  return data.items;
}
