export interface TonWalletProvider {
  isTonWallet: boolean;
  send(method: string, params?: any[]): Promise<any>;
  on(eventName: string, handler: (...data: any[]) => any): void;
}
