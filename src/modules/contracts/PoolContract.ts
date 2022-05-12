import { Big } from 'big.js';
import BN from 'bn.js';
import { contractAddress, Cell, TonClient, ContractSource, Address } from 'ton';
import { PoolOperation } from './enums/PoolOperation';
import { PoolStatus } from './enums/PoolStatus';
import { TradeDirection } from './enums/TradeDirection';

export class PoolContract {
  constructor(
    private readonly client: TonClient,
    public readonly source: ContractSource,
    public readonly address: Address,
  ) {
  }

  static create(
    client: TonClient,
    source: ContractSource,
  ): PoolContract {
    return new PoolContract(
      client,
      source,
      contractAddress(source),
    );
  }

  isDeployed(): Promise<boolean> {
    return this.client.isContractDeployed(this.address);
  }

  createInitializeMessage(queryId = 0): Cell {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.INIT, 32);
    cell.bits.writeUint(queryId || 0, 64);

    return cell;
  }

  createSetControllerRequest(controllerAddress: Address, queryId = 0): Cell {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.SET_CONTROLLER, 32);
    cell.bits.writeUint(queryId || 0, 64);
    cell.bits.writeAddress(controllerAddress);

    return cell;
  }

  createDepositRequest(tradeDirection: TradeDirection, minimumPoolTokenAmount: number | BN = 0): Cell {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.DEPOSIT, 32);
    cell.bits.writeUint(tradeDirection, 1);
    cell.bits.writeCoins(minimumPoolTokenAmount);

    return cell;
  }

  createSwapRequest(tradeDirection: TradeDirection, minimumAmountOut: number | BN = 0): Cell {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.SWAP, 32);
    cell.bits.writeUint(tradeDirection, 1);
    cell.bits.writeCoins(minimumAmountOut);

    return cell;
  }

  createSwapNativeRequest(
    tradeDirection: TradeDirection,
    minimumAmountOut: BN | number = 0,
    queryId: BN | number = 0,
  ) {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.SWAP_NATIVE, 32);
    cell.bits.writeUint(queryId, 64);
    cell.bits.writeUint(tradeDirection, 1);
    cell.bits.writeCoins(minimumAmountOut);

    return cell;
  }

  createWithdrawSingleRequest(tradeDirection: TradeDirection, minimumAmountOut: number | BN = 0): Cell {
    const cell = new Cell();

    cell.bits.writeUint(PoolOperation.WITHDRAW_SINGLE, 32);
    cell.bits.writeUint(tradeDirection, 1);
    cell.bits.writeCoins(minimumAmountOut);

    return cell;
  }

  async getStatus(): Promise<PoolStatus> {
    const { stack } = await this.client.callGetMethod(this.address, 'get_status', []);

    return parseInt(stack[0][1].replace(/^0x/, ''), 16);
  }

  async getTokenPrices(): Promise<any> {
    const { stack } = await this.client.callGetMethod(this.address, 'get_token_prices', []);

    const leftTokenNumerator = new BN(stack[0][1].replace(/^0x/, ''), 'hex');
    const rightTokenNumerator = new BN(stack[1][1].replace(/^0x/, ''), 'hex');
    const denominator = new BN(stack[2][1].replace(/^0x/, ''), 'hex');

    const leftTokenPrice = new Big(leftTokenNumerator.toString()).div(denominator.toString());
    const rightTokenPrice = new Big(rightTokenNumerator.toString()).div(denominator.toString());

    return {
      leftTokenPrice,
      rightTokenPrice,
    };
  }

  async estimateSwap(amountIn: number | BN, tradeDirection: TradeDirection): Promise<Big> {
    const { stack } = await this.client.callGetMethod(this.address, 'estimate_swap', [
      ['int', amountIn.toString()],
      ['int', tradeDirection.toString()],
    ]);

    return new Big(new BN(stack[0][1].replace(/^0x/, ''), 'hex').toString()).div(1_000_000_000);
  }
}
