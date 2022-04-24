export interface RawMessage {
  '@type': 'raw.message';
  source: string;
  destination: string;
  value: string;
  fwd_fee: string;
  ihr_fee: string;
  created_lt: string;
  body_hash: string;
  msg_data: {
    '@type': 'msg.dataRaw',
    body?: string;
    text?: string;
    init_state: string;
  },
  message: string;
}
