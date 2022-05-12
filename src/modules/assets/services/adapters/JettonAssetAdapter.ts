import { Big } from 'big.js';
import BN from 'bn.js';
import { Address, Cell, toNano, TonClient } from 'ton';
import { JettonMasterContract } from '../../../contracts/JettonMasterContract';
import { PoolContract } from '../../../contracts/PoolContract';
import { TradeDirection } from '../../../contracts/enums/TradeDirection';
import { JettonOperation } from '../../../jettons/enums/JettonOperation';
import { WalletService } from '../../../wallet/services/WalletService';
import type { TransactionRequest } from '../../../wallet/services/TransactionRequest';
import type { JettonRef } from '../../types/JettonRef';
import type { Transaction } from '../../types/Transaction';
import type { AssetAdapter } from '../AssetAdapter';

export class JettonAssetAdapter implements AssetAdapter {
  constructor(
    private readonly tonClient: TonClient,
    private readonly walletService: WalletService,
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
        operation: jettonTransaction.operation === JettonOperation.TRANSFER ? 'out' : 'in',
        from: jettonTransaction.operation === JettonOperation.INTERNAL_TRANSFER
          ? (jettonTransaction.from ? Address.parse(jettonTransaction.from) : null)
          : ownerAddress,
        to: jettonTransaction.operation === JettonOperation.TRANSFER
          ? (jettonTransaction.destination ? Address.parse(jettonTransaction.destination) : null)
          : ownerAddress,
        amount: new Big(jettonTransaction.amount).div(1_000_000_000),
        comment: jettonTransaction.comment,
      }));
    } catch {
      return [];
    }
  }

  async requestTransaction<S>(
    adapterId: string,
    session: S,
    asset: JettonRef,
    request: TransactionRequest,
  ): Promise<void> {
    const contract = new JettonMasterContract(this.tonClient, null as any, Address.parse(asset.contractAddress));

    const wallet = await this.walletService.getWallet(adapterId, session);

    const ownerAddress = Address.parse(wallet.address);
    const jettonWallet = await contract.getJettonWallet(ownerAddress);

    const forwardPayload = new Cell();

    if (request.payload) {
      if (request.payload instanceof Cell) {
        forwardPayload.writeCell(request.payload);
      } else {
        forwardPayload.bits.writeBuffer(request.payload);
      }
    } else {
      if (request.text) {
        forwardPayload.bits.writeUint(0x00, 8);
        forwardPayload.bits.writeBuffer(request.payload ?? Buffer.from(request.text ?? ''));
      }
    }

    const transferRequest = jettonWallet.createTransferRequest({
      queryId: 0,
      amount: new BN(request.value),
      destination: Address.parse(request.to),
      responseDestination: null,
      forwardAmount: 0,
      forwardPayload,
    });

    await this.walletService.requestTransaction(
      adapterId,
      session,
      {
        to: jettonWallet.address.toFriendly(),
        value: toNano(0.035).toString(10),
        timeout: request.timeout,
        payload: transferRequest,
      },
    );
  }

  async requestSwap<S>(
    adapterId: string,
    session: S,
    asset: JettonRef,
    poolContractAddress: Address,
    tradeDirection: TradeDirection,
    sourceAmountIn: BN | number,
    minimumAmountOut: BN | number = 0,
    queryId: BN | number = 0,
  ): Promise<void> {
    const poolContract = new PoolContract(this.tonClient, null as any, poolContractAddress);

    const contract = new JettonMasterContract(this.tonClient, null as any, Address.parse(asset.contractAddress));
    const wallet = await this.walletService.getWallet(adapterId, session);
    const ownerAddress = Address.parse(wallet.address);
    const jettonWallet = await contract.getJettonWallet(ownerAddress);

    const swapRequest = poolContract.createSwapRequest(tradeDirection, minimumAmountOut);

    const transferRequest = jettonWallet.createTransferRequest({
      queryId,
      amount: sourceAmountIn,
      destination: poolContract.address,
      responseDestination: null,
      forwardAmount: toNano(0.055),
      forwardPayload: swapRequest,
    });

    await this.walletService.requestTransaction(
      adapterId,
      session,
      {
        to: jettonWallet.address.toFriendly(),
        value: toNano(0.09).toString(10),
        timeout: 2 * 60 * 1000,
        payload: transferRequest,
      },
    );
  }
}
