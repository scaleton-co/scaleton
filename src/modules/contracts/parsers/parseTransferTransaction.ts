import { JettonOperation } from '../../jettons/enums/JettonOperation';
import type { JettonOutcomeTransaction } from '../../jettons/types/JettonOutcomeTransaction';
import type { Slice, TonTransaction } from 'ton';

/**
  transfer query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
    response_destination:MsgAddress custom_payload:(Maybe ^Cell)
    forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
    = InternalMsgBody;
  */

export function parseTransferTransaction(bodySlice: Slice, transaction: TonTransaction): JettonOutcomeTransaction {
  const queryId = bodySlice.readUint(64);
  const amount = bodySlice.readCoins();
  const destination = bodySlice.readAddress();

  bodySlice.readAddress(); // response_destination
  bodySlice.skip(1); // custom_payload
  bodySlice.readCoins(); // forward_ton_amount

  const comment = (!bodySlice.readBit() && bodySlice.remaining && (bodySlice.remaining % 8) === 0)
    ? bodySlice.readRemainingBytes().toString()
    : '';

  return {
    operation: JettonOperation.TRANSFER,
    time: transaction.time,
    queryId: queryId.toString(10),
    amount: amount.toString(10),
    destination: destination?.toFriendly() ?? null,
    comment,
  };
}
