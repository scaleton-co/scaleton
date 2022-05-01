export interface TransactionRequest {
  /** Destination */
  to: string;

  /** Amount in nano-tons */
  value: string;

  /** Timeout */
  timeout: number;

  stateInit?: Buffer | null;

  text?: string | null;

  payload?: Buffer | null;
}
