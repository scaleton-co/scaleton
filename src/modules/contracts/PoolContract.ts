import { Big } from 'big.js';
import BN from 'bn.js';
import { contractAddress, TonClient, ContractSource, Address } from 'ton';
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

  createDepositRequestText(
    tradeDirection: TradeDirection,
    minimumPoolTokenAmount: number | BN = 0,
    queryId: number | BN = 0,
  ) {
    const queryIdText = new BN(queryId).toString('hex', 16);
    const tradeDirectionText = new BN(tradeDirection).toString('hex', 1);
    const minimumPoolTokenAmountText = new BN(minimumPoolTokenAmount).toString('hex', 64);

    return `dep#${queryIdText}${tradeDirectionText}${minimumPoolTokenAmountText}`;
  }

  createSwapRequestText(
    tradeDirection: TradeDirection,
    minimumAmountOut: number | BN = 0,
    queryId:  number | BN = 0,
  ) {
    const queryIdText = new BN(queryId).toString('hex', 16);
    const tradeDirectionText = new BN(tradeDirection).toString('hex', 1);
    const minimumAmountOutText = new BN(minimumAmountOut).toString('hex', 64);

    return `swp#${queryIdText}${tradeDirectionText}${minimumAmountOutText}`;
  }

  createWithdrawSingleRequestText(
    tradeDirection: TradeDirection,
    minimumAmountOut: BN | number,
    queryId:  number | BN = 0,
  ) {
    const queryIdText = new BN(queryId).toString('hex', 16);
    const tradeDirectionText = new BN(tradeDirection).toString('hex', 1);
    const minimumAmountOutText = new BN(minimumAmountOut).toString('hex', 64);

    return `wds#${queryIdText}${tradeDirectionText}${minimumAmountOutText}`;
  }

  async getStatus(): Promise<PoolStatus> {
    const { stack } = await this.client.callGetMethod(this.address, 'get_status', []);

    return parseInt(stack[0][1].replace(/^0x/, ''), 16);
  }

  async getTokenPrices(): Promise<any> {
    const { stack } = await this.client.callGetMethod(this.address, 'get_token_price', []);

    const leftTokenNumerator = new BN(stack[0][1].replace(/^0x/, ''), 'hex');
    const leftTokenDenominator = new BN(stack[1][1].replace(/^0x/, ''), 'hex');

    const leftTokenPrice = new Big(leftTokenNumerator.toString()).div(leftTokenDenominator.toString());
    const rightTokenPrice = new Big(1).div(leftTokenPrice);

    console.log(leftTokenPrice.toNumber());

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
