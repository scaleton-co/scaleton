import { RawMessage } from "./RawMessage";

export interface RawTransaction {
  '@type': 'raw.transaction';
  utime: number;
  data: string;
  transaction_id: {
    '@type': 'internal.transactionId';
    lt: string;
    hash: string;
  },
  fee: string;
  storage_fee: string;
  other_fee: string;
  in_msg: RawMessage;
  out_msgs: RawMessage[];
}
