import { JettonOperation } from '../enums/JettonOperation';

export interface JettonOutcomeTransaction {
  operation: JettonOperation.TRANSFER;
  time: number;
  queryId: string;
  amount: string;
  destination: string | null;
  comment: string;
}
