import { Button, Modal, Table } from 'antd';
import React, { useMemo } from 'react';
import { useAppSelector } from '../../../hooks';
import { JettonOperation } from '../enums/JettonOperation';
import { presentBalance } from '../utils/presentBalance';
import { timeAgo } from '../utils/timeAgo';
import { Address } from './Address/Address';
import { JettonOperationTag } from './JettonOperationTag/JettonOperationTag';

export function JettonsTransactionsModal({ account, jettonWallet, visible, onClose }: {
  account: string,
  jettonWallet: string | null,
  visible: boolean;
  onClose: () => void;
}) {
  const isLoading = useAppSelector(state => !!(jettonWallet && state.jettons.history[jettonWallet]?.isLoading) ?? true);
  const transactions = useAppSelector(state => (jettonWallet && state.jettons.history[jettonWallet]?.transactions) || []);
  const jettons = useAppSelector(state => state.jettons.contracts);
  const allBalances = useAppSelector(state => state.jettons.balances);

  const symbol = useMemo(
    () => {
      const accountBalances = allBalances[account];

      if (!accountBalances) return null;

      for (const jettonContract in accountBalances) {
        if (accountBalances[jettonContract].wallet === jettonWallet) {
          return jettons.find(jetton => jetton.address === jettonContract)?.symbol ?? null;
        }
      }

      return null;
    },
    [allBalances, account, jettonWallet, jettons],
  );

  return (
    <Modal
      title="Transactions"
      centered
      visible={!!jettonWallet && visible}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      onCancel={onClose}
    >
      <Table
        size="small"
        loading={isLoading}
        dataSource={transactions.map((transaction, transactionIndex) => ({
          key: transactionIndex,
          time: timeAgo.format(new Date(transaction.time * 1000)),
          operation: transaction.operation,
          from: transaction.operation === JettonOperation.TRANSFER ? account : transaction.from,
          to: transaction.operation === JettonOperation.TRANSFER ? transaction.destination : account,
          amount: transaction.amount,
          comment: transaction.comment,
        }))}
        expandable={{
          expandedRowRender: transaction => (
            <>Comment: {transaction.comment}</>
          ),
          rowExpandable: transaction => !!transaction.comment,
        }}
      >
        <Table.Column
          fixed="left"
          width={100}
          title="Age"
          dataIndex="time"
          key="age"
        />

        <Table.Column
          ellipsis
          title="From"
          dataIndex="from"
          key="from"
          render={(address: string) => <a href={`/address/${address}`}><Address value={address}/></a>}
        />

        <Table.Column
          width={60}
          fixed
          dataIndex="operation"
          key="operation"
          render={(operation: JettonOperation, transaction: any) => <JettonOperationTag type={operation} from={transaction.from} />}
        />

        <Table.Column
          ellipsis
          title="To"
          dataIndex="to"
          key="to"
          render={(address: string) => <a href={`/address/${address}`}><Address value={address}/></a>}
        />

        <Table.Column
          fixed="right"
          width={160}
          align="right"
          title="Value"
          dataIndex="amount"
          key="amount"
          render={amount => <>{presentBalance(amount)} {symbol}</>}
        />
      </Table>
    </Modal>
  );
}
