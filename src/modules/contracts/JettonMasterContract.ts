import BN from 'bn.js';
import { Cell } from 'ton';
import { JettonWalletContract } from './JettonWalletContract';
import type { ContractSource, TonClient } from 'ton';
import { Address } from 'ton';

export class JettonMasterContract {
  private static knownWallets: Map<string, string> = new Map();

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

  private async resolveWalletAddress(owner: Address): Promise<Address> {
    let knownWalletAddress = JettonMasterContract.knownWallets.get(`${this.address.toString()}|${owner.toString()}`);

    if (knownWalletAddress) {
      return Address.parseRaw(knownWalletAddress);
    }

    const ownerAddressCell = new Cell();
    ownerAddressCell.bits.writeAddress(owner);

    const { stack } = await this.client.callGetMethod(this.address, 'get_wallet_address', [
      [
        'tvm.Slice',
        ownerAddressCell.toBoc({ idx: false }).toString('base64'),
      ],
    ]);

    const walletAddress = Cell
      .fromBoc(Buffer.from(stack[0][1].bytes, 'base64'))[0]
      .beginParse()
      .readAddress()!;

    JettonMasterContract.knownWallets.set(`${this.address.toString()}|${owner.toString()}`, walletAddress.toString());

    return walletAddress;
  }

  async getJettonWallet(ownerAddress: Address): Promise<JettonWalletContract> {
    return new JettonWalletContract(
      this.client,
      null as any,
      await this.resolveWalletAddress(ownerAddress),
    );
  }
}
