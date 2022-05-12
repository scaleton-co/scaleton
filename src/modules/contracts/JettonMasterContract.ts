import BN from 'bn.js';
import { Cell } from 'ton';
import { JettonWalletContract } from './JettonWalletContract';
import type { Address, ContractSource, TonClient } from 'ton';

export class JettonMasterContract {
  constructor(
    private readonly client: TonClient,
    public readonly source: ContractSource,
    public readonly address: Address,
  ) {
    this.client = client;
    this.source = source;
    this.address = address;
  }

  createChangeAdminRequest(newAdminAddress: Address): Cell {
    const cell = new Cell();

    cell.bits.writeUint(3, 32); // op
    cell.bits.writeUint(0, 64); // queryId
    cell.bits.writeAddress(newAdminAddress);

    return cell;
  }

  async getJettonData() {
    const { stack } = await this.client.callGetMethod(this.address, 'get_jetton_data', []);

    const totalSupply = new BN(stack[0][1].replace(/^0x/, ''), 'hex');

    const adminAddress = Cell
      .fromBoc(Buffer.from(stack[2][1].bytes, 'base64'))[0]
      .beginParse()
      .readAddress();

    const content = Cell.fromBoc(Buffer.from(stack[3][1].bytes, 'base64'))[0].bits.buffer.slice(1);
    const jettonWalletCode = Cell.fromBoc(Buffer.from(stack[4][1].bytes, 'base64'))[0];

    return {
      totalSupply,
      adminAddress,
      content,
      jettonWalletCode,
    };
  }

  async getJettonWallet(ownerAddress: Address): Promise<JettonWalletContract> {
    const ownerAddressCell = new Cell();
    ownerAddressCell.bits.writeAddress(ownerAddress);

    const { stack } = await this.client.callGetMethod(this.address, 'get_wallet_address', [
      ['tvm.Slice', ownerAddressCell.toBoc({ idx: false }).toString('base64')]
    ]);

    const jettonWalletAddress = Cell
      .fromBoc(Buffer.from(stack[0][1].bytes, 'base64'))[0]
      .beginParse()
      .readAddress()!;

    return new JettonWalletContract(this.client, null as any, jettonWalletAddress);
  }
}
