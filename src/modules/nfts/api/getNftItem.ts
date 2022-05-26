import { NftItem } from '../types/NftItem';
import { scaletonClient } from '../../common';

export async function getNftItem(address: string): Promise<NftItem | null> {
  try {
    const { data } = await scaletonClient.get(`/v1/nfts/${address}`);
    return data.item;
  } catch {
    return null;
  }
}
