import BN from 'bn.js';
import { Address, Cell, toNano, TonClient } from 'ton';
import { TON_WALLET_EXTENSION_URL, TonWalletClient } from './TonWalletClient';
import { Wallet } from '../common/Wallet';
import { WalletAdapter } from '../common/WalletAdapter';
import { WalletFeature } from '../common/WalletFeature';
import { JettonMasterContract } from '../../contracts/JettonMasterContract';
import { timeout } from '../common/utils';
import { DEFAULT_JETTON_GAS_FEE } from '../common/constants';

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class TonWalletWalletAdapter implements WalletAdapter<boolean> {
  readonly features: WalletFeature[] = [
    WalletFeature.TRANSFER,
    WalletFeature.JETTON_TRANSFER,
  ];

  constructor(
    private readonly tonClient: TonClient,
    private readonly tonWalletClient: TonWalletClient,
  ) {
  }

  async createSession(): Promise<boolean> {
    try {
      await this.tonWalletClient.ready(150);
      return true;
    } catch (error) {
      window.open(TON_WALLET_EXTENSION_URL, '_blank');
      throw error;
    }
  }

  async awaitReadiness(session: boolean): Promise<Wallet> {
    await this.tonWalletClient.ready();

    const [[wallet]] = await Promise.all([
      this.tonWalletClient.requestWallets(),
      delay(150),
    ]);

    if (!wallet) {
      throw new Error('TON Wallet is not configured.');
    }

    return wallet;
  }

  getWallet(session: boolean): Promise<Wallet> {
    return this.awaitReadiness(session);
  }

  isAvailable(): boolean {
    return !!window.ton?.isTonWallet;
  }

  async requestTransfer(
    session: boolean,
    destination: string,
    amount: string,
    comment: string,
    requestTimeout: number,
  ): Promise<void> {
    await Promise.race([
      this.tonWalletClient.sendTransaction({
        to: destination,
        value: amount,
        dataType: 'text',
        data: comment,
      }),
      timeout(requestTimeout, 'Transaction request exceeded timeout.'),
    ]);
  }

  async requestJettonTransfer(
    session: boolean,
    contractAddress: string,
    destination: string,
    amount: string,
    forwardPayload: string,
    requestTimeout: number,
    forwardAmount: number = 0,
    gasFee: number = DEFAULT_JETTON_GAS_FEE,
  ): Promise<void> {
    const contract = new JettonMasterContract(this.tonClient, null as any, Address.parse(contractAddress));
    const wallet = await this.getWallet(session);
    const ownerAddress = Address.parse(wallet.address);
    const jettonWallet = await contract.getJettonWallet(ownerAddress);

    const forwardComment = new Cell();

    forwardComment.bits.writeUint(0, 32);
    forwardComment.bits.writeBuffer(Buffer.from(forwardPayload));

    const transferRequest = jettonWallet.createTransferRequest({
      queryId: 0,
      amount: new BN(amount),
      destination: Address.parse(destination),
      forwardAmount: toNano(forwardAmount),
      forwardPayload: forwardComment,
    });

    await Promise.race([
      this.tonWalletClient.sendTransaction({
        to: jettonWallet.address.toFriendly(),
        value: toNano(gasFee).toString(10),
        dataType: 'boc',
        data: transferRequest.toBoc().toString('base64'),
      }),
      timeout(requestTimeout, 'Transaction request exceeded timeout.'),
    ]);
  }
}
