import { Slice } from 'ton';
import { RawTransaction } from '../../ton/types/RawTransaction';
import { JettonOperation } from '../enums/JettonOperation';
import { JettonIncomeTransaction } from '../types/JettonIncomeTransaction';

/**
  internal_transfer  query_id:uint64 amount:(VarUInteger 16) from:MsgAddress
    response_address:MsgAddress
    forward_ton_amount:(VarUInteger 16)
    forward_payload:(Either Cell ^Cell)
    = InternalMsgBody;
*/

export function parseInternalTransferTransaction(bodySlice: Slice, transaction: RawTransaction): JettonIncomeTransaction {
  const queryId = bodySlice.readUint(64);
  const amount = bodySlice.readCoins();
  const from = bodySlice.readAddress();

  bodySlice.readAddress(); // response_address
  bodySlice.readCoins(); // forward_ton_amount

  const comment = (!bodySlice.readBit() && bodySlice.remaining && (bodySlice.remaining % 8) === 0)
    ? bodySlice.readRemainingBytes().toString()
    : '';

  return {
    operation: JettonOperation.INTERNAL_TRANSFER,
    time: transaction.utime,
    queryId: queryId.toString(10),
    amount: amount.toString(10),
    from: from?.toFriendly() ?? null,
    comment,
  };
}
