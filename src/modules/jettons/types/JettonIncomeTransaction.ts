import { JettonOperation } from "../enums/JettonOperation";

export interface JettonIncomeTransaction {
  operation: JettonOperation.INTERNAL_TRANSFER;
  time: number;
  queryId: string;
  amount: string;
  from: string | null;
  comment: string;
}
