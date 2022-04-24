import * as Sentry from '@sentry/react';
import { Cell } from 'ton';
import { RawTransaction } from '../../ton/types/RawTransaction';
import { JettonOperation } from '../enums/JettonOperation';
import { parseInternalTransferTransaction } from './parseInternalTransferTransaction';
import { parseTransferTransaction } from './parseTransferTransaction';
import type { JettonTransaction } from '../types/JettonTransaction';

/**
 * Parses jetton-specific transactions body.
 */
export function parseTransaction(transaction: RawTransaction): JettonTransaction | null {
  try {
    if (!transaction.in_msg.msg_data.body) {
      return null; // Not a jetton transaction
    }

    const [bodyCell] = Cell.fromBoc(
      Buffer.from(transaction.in_msg.msg_data.body, 'base64'),
    );

    const bodySlice = bodyCell.beginParse();

    const operation = bodySlice.readUint(32).toNumber();

    switch (operation) {
      case JettonOperation.TRANSFER:
        return parseTransferTransaction(bodySlice, transaction);

      case JettonOperation.INTERNAL_TRANSFER:
        return parseInternalTransferTransaction(bodySlice, transaction);

      default:
        return null; // Unknown operation
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        transaction_lt: transaction.transaction_id.lt,
        transaction_hash: transaction.transaction_id.hash,
      },
    });

    return null;
  }
}
