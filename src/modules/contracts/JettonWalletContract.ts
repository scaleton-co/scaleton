import BN from 'bn.js';
import { Address, Cell } from 'ton';
import { JettonOperation } from '../jettons/enums/JettonOperation';
import { parseInternalTransferTransaction } from './parsers/parseInternalTransferTransaction';
import { parseTransferTransaction } from './parsers/parseTransferTransaction';
import type { JettonTransaction } from '../jettons/types/JettonTransaction';
import type { TonClient, Contract, ContractSource } from 'ton';

export class JettonWalletContract implements Contract {
  constructor(
    private readonly client: TonClient,
    public readonly source: ContractSource,
    public readonly address: Address,
  ) {
  }

  isDeployed() {
    return this.client.isContractDeployed(this.address);
  }

  async getData() {
    const { stack } = await this.client.callGetMethod(this.address, 'get_wallet_data', []);

    const balance = new BN(stack[0][1].replace(/^0x/, ''), 'hex');
    // balance
    // owner_address
    // jetton_master_address
    // jetton_wallet_code

    return {
      balance,
    };
  }

  async getTransactions() {
    const transactions = await this.client.getTransactions(this.address, {
      limit: 20,
    });

    return transactions
      .map((transaction): JettonTransaction | null => {
        if (transaction.inMessage?.body?.type !== 'data') {
          return null; // Not a jetton transaction
        }

        const bodySlice = Cell.fromBoc(transaction.inMessage.body.data)[0].beginParse();
        const operation = bodySlice.readUint(32).toNumber();

        switch (operation) {
          case JettonOperation.TRANSFER:
            return parseTransferTransaction(bodySlice, transaction);

          case JettonOperation.INTERNAL_TRANSFER:
            return parseInternalTransferTransaction(bodySlice, transaction);

          default:
            return null; // Unknown operation
        }
      })
      .filter(transaction => !!transaction) as JettonTransaction[];
  }

  createTransferRequest({
    queryId = 0,
    amount,
    destination,
    responseDestination = null,
    forwardAmount = 0,
    forwardPayload = null,
  }: {
    queryId: number | BN,
    amount: number | BN;
    destination: Address;
    responseDestination?: Address | null;
    forwardAmount: number | BN;
    forwardPayload: Cell | null;
  }): Cell {
    const cell = new Cell();

    cell.bits.writeUint(0xf8a7ea5, 32);
    cell.bits.writeUint(queryId, 64);
    cell.bits.writeCoins(amount);
    cell.bits.writeAddress(destination);
    cell.bits.writeAddress(responseDestination);
    cell.bits.writeBit(false);
    cell.bits.writeCoins(forwardAmount);

    if (!forwardPayload || forwardPayload.bits.length <= cell.bits.available) {
      cell.bits.writeBit(false);
      if (forwardPayload) {
        cell.writeCell(forwardPayload);
      }
    } else {
      cell.bits.writeBit(true);
      cell.withReference(forwardPayload);
    }

    return cell;
  }
}
