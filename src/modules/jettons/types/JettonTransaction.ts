import { JettonIncomeTransaction } from './JettonIncomeTransaction';
import { JettonOutcomeTransaction } from './JettonOutcomeTransaction';
import { JettonBurnTransaction } from './JettonBurnTransaction';

export type JettonTransaction = JettonIncomeTransaction | JettonOutcomeTransaction | JettonBurnTransaction;
