import { Wallet } from './Wallet';
import { TonhubCreatedSession } from "ton-x/dist/connector/TonhubConnector";
import { TransactionRequest } from "./TransactionRequest";

export interface WalletAdapter<S> {
  isAvailable(): boolean;
  createSession(): Promise<S>;
  awaitReadiness(session: S): Promise<Wallet>;
  requestTransaction(session: S, request: TransactionRequest): Promise<void>;
}
