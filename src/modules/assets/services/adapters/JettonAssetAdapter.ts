import { Big } from 'big.js';
import BN from 'bn.js';
import { Address, TonClient } from 'ton';
import { JettonMasterContract } from '../../../contracts/JettonMasterContract';
import { JettonOperation } from '../../../jettons/enums/JettonOperation';
import type { JettonRef, Transaction } from '../../types';
import type { AssetAdapter } from '../AssetAdapter';

export class JettonAssetAdapter implements AssetAdapter {
  constructor(
    private readonly tonClient: TonClient,
  ) {
  }

  async getBalance(ownerAddress: Address, asset: JettonRef): Promise<Big> {
    try {
      const contract = new JettonMasterContract(
        this.tonClient,
        null as any,
        Address.parse(asset.contractAddress),
      );

      const jettonWallet = await contract.getJettonWallet(ownerAddress);
      const { balance } = await jettonWallet.getData();

      return new Big(balance.toString()).div(1_000_000_000);
    } catch {
      return new Big(0);
    }
  }

  async getTransactions(ownerAddress: Address, asset: JettonRef): Promise<Transaction[]> {
    try {
      const contract = new JettonMasterContract(this.tonClient, null as any, Address.parse(asset.contractAddress));
      const jettonWallet = await contract.getJettonWallet(ownerAddress);
      const jettonTransactions = await jettonWallet.getTransactions();

      return jettonTransactions.map((jettonTransaction): Transaction => ({
        queryId: new BN(jettonTransaction.queryId),
        time: new Date(jettonTransaction.time * 1000),
        operation: jettonTransaction.operation === JettonOperation.TRANSFER
          ? 'out'
          : (jettonTransaction.operation === JettonOperation.BURN
            ? 'burn'
            : (jettonTransaction.from ? 'in' : 'mint')),
        from: jettonTransaction.operation === JettonOperation.INTERNAL_TRANSFER
          ? (jettonTransaction.from ? Address.parse(jettonTransaction.from) : null)
          : ownerAddress,
        to: jettonTransaction.operation === JettonOperation.TRANSFER
          ? (jettonTransaction.destination ? Address.parse(jettonTransaction.destination) : null)
          : ownerAddress,
        amount: new Big(jettonTransaction.amount).div(1_000_000_000),
        comment: jettonTransaction.operation === JettonOperation.TRANSFER || jettonTransaction.operation === JettonOperation.INTERNAL_TRANSFER
          ? jettonTransaction.comment
          : null,
        body: null,
      }));
    } catch {
      return [];
    }
  }
}
