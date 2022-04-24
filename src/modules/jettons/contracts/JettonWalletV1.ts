import BN from 'bn.js';
import { Address, Cell } from 'ton';
import { tonClient } from '../../ton/tonClient';
import { JettonOperation } from '../enums/JettonOperation';
import type { HttpProvider } from 'tonweb/dist/types/providers/http-provider';

export class JettonWalletV1 {
  constructor(
    private readonly provider: HttpProvider,
  ) {
  }

  async getBalance(jettonWalletAddress: string) {
    try {
      const { stack, exit_code } = await this.provider.call(jettonWalletAddress, 'get_wallet_data');

      if (exit_code !== 0) {
        throw new Error('Cannot retrieve balance.');
      }

      return new BN(stack[0][1].slice(2), 'hex');
    } catch {
      return new BN(0);
    }
  }

  createTransferBody({
    queryId,
    jettonAmount,
    toAddress,
    responseAddress,
    forwardAmount,
    forwardPayload,
  }: {
    queryId?: number,
    jettonAmount: number | BN,
    toAddress: string,
    responseAddress?: string,
    forwardAmount?: number | BN,
    forwardPayload?: Buffer,
  }) {
    const cell = new Cell();

    cell.bits.writeUint(JettonOperation.TRANSFER, 32); // request_transfer op
    cell.bits.writeUint(queryId || 0, 64);
    cell.bits.writeCoins(jettonAmount);
    cell.bits.writeAddress(Address.parse(toAddress));
    cell.bits.writeAddress(responseAddress ? Address.parse(responseAddress) :  null);
    cell.bits.writeBit(false); // null custom_payload
    cell.bits.writeCoins(forwardAmount || new BN(0));
    cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

    if (forwardPayload) {
      cell.bits.writeBuffer(forwardPayload);
    }

    return cell;
  }
}

export const jettonWalletV1 = new JettonWalletV1(tonClient);
