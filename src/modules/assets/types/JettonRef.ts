export interface JettonRef {
  id: string;
  type: 'jetton';
  isCustom?: boolean;
  name: string;
  symbol: string;
  contractAddress: string;
  url?: string;
}
