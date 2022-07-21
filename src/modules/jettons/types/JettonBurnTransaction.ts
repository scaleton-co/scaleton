import { JettonOperation } from "../enums/JettonOperation";

export interface JettonBurnTransaction {
  operation: JettonOperation.BURN;
  time: number;
  queryId: string;
  amount: string;
}
