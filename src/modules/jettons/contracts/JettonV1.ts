import BN from 'bn.js';
import { Cell } from 'ton';
import { tonWebClient } from '../../common/tonWebClient';
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
}

export const jettonV1 = new JettonV1(tonWebClient);
