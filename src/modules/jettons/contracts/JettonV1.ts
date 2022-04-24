import BN from 'bn.js';
import { Address, Cell } from 'ton';
import { tonClient } from '../../ton/tonClient';
import type { HttpProvider } from 'tonweb/dist/types/providers/http-provider';

export class JettonV1 {
  constructor(
    private readonly provider: HttpProvider,
  ) {
  }

  async getData(jettonMasterAddress: string) {
    const { stack, exit_code } = await this.provider.call(jettonMasterAddress, 'get_jetton_data');

    if (exit_code !== 0) {
      throw new Error('Cannot retrieve jetton data.');
    }

    const [adminAddressCell] = Cell.fromBoc(
      Buffer.from(stack[2][1].bytes, 'base64')
    );

    const [contentUriCell] = Cell.fromBoc(
      Buffer.from(stack[3][1].bytes, 'base64')
    );

    const totalSupply = new BN(stack[0][1].substring(2), 'hex');
    const isMutable = stack[1][1] !== '0x0';
    const adminAddress = adminAddressCell.beginParse().readAddress();
    const contentUri = contentUriCell.bits.buffer.slice(1).toString();

    return {
      totalSupply,
      isMutable,
      adminAddress,
      contentUri,
    };
  }

  async getWalletAddress(jettonMasterAddress: string, ownerAddress: string): Promise<string> {
    const ownerAddressCell = new Cell();
    ownerAddressCell.bits.writeAddress(Address.parse(ownerAddress));
    const ownerAddressCellBoc = await ownerAddressCell.toBoc({ idx: false });

    const { stack, exit_code } = await this.provider.call(
      jettonMasterAddress,
      'get_wallet_address',
      [
        ['tvm.Slice', ownerAddressCellBoc.toString('base64')],
      ],
    );

    if (exit_code !== 0) {
      throw new Error('Cannot retrieve a wallet address');
    }

    const [walletAddressCell] = Cell.fromBoc(
      Buffer.from(stack[0][1].bytes, 'base64')
    );

    const walletAddress = walletAddressCell.beginParse().readAddress()!;

    return walletAddress.toFriendly();
  }
}

export const jettonV1 = new JettonV1(tonClient);
