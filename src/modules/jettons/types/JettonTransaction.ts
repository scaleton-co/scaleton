import { JettonIncomeTransaction } from './JettonIncomeTransaction';
import { JettonOutcomeTransaction } from './JettonOutcomeTransaction';

export type JettonTransaction = JettonIncomeTransaction | JettonOutcomeTransaction;
