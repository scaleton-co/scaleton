import type { Slice, TonTransaction } from 'ton';
import { JettonOperation } from '../../jettons/enums/JettonOperation';
import { JettonBurnTransaction } from '../../jettons/types/JettonBurnTransaction';

/**
 burn#595f07bc query_id:uint64 amount:(VarUInteger 16)
   response_destination:MsgAddress custom_payload:(Maybe ^Cell)
   = InternalMsgBody;
  */

export function parseBurnTransaction(bodySlice: Slice, transaction: TonTransaction): JettonBurnTransaction {
  const queryId = bodySlice.readUint(64);
  const amount = bodySlice.readCoins();

  // bodySlice.readAddress(); // response_destination
  // bodySlice.skip(1); // custom_payload

  return {
    operation: JettonOperation.BURN,
    time: transaction.time,
    queryId: queryId.toString(10),
    amount: amount.toString(10),
  };
}
