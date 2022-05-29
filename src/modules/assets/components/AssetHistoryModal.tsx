import { Button, Modal, Table } from 'antd';
import React from 'react';
import { useAppSelector } from '../../../hooks';
import { presentBalance } from '../../jettons/utils/presentBalance';
import { timeAgo } from '../../jettons/utils/timeAgo';
import { AddressText } from '../../common/components/AddressText/AddressText';
import { AssetOperationTag } from './AssetOperationTag/AssetOperationTag';
import { createHistorySelector } from '../selectors/createHistorySelector';
import { createHistoryLoadingSelector } from '../selectors/createHistoryLoadingSelector';
import { createAssetSymbolSelector } from '../selectors/createAssetSymbolSelector';
import { TransactionType } from '../types';
import { Link } from 'react-router-dom';

interface AssetHistoryModalProps {
  account: string;
  assetId: string;
  onClose: () => void;
}

export function AssetHistoryModal({ account, assetId, onClose }: AssetHistoryModalProps) {
  const selectHistoryLoading = createHistoryLoadingSelector(account, assetId);
  const selectHistory = createHistorySelector(account, assetId);
  const selectAssetSymbol = createAssetSymbolSelector(assetId);

  const isHistoryLoading = useAppSelector(selectHistoryLoading);
  const history = useAppSelector(selectHistory);
  const symbol = useAppSelector(selectAssetSymbol);

  return (
    <Modal
      title="Transactions"
      centered
      visible
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      onCancel={onClose}
      destroyOnClose
    >
      <Table
        size="small"
        loading={isHistoryLoading}
        dataSource={history.map((transaction, transactionIndex) => ({
          key: transactionIndex,
          time: timeAgo.format(new Date(transaction.time)),
          operation: transaction.operation,
          from: transaction.operation === 'out' ? account : transaction.from,
          to: transaction.operation === 'out' ? transaction.to : account,
          amount: transaction.amount,
          comment: transaction.comment,
        }))}
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
          render={(address: string) => <Link to={`/${address}/assets`}><AddressText value={address}/></Link>}
        />

        <Table.Column
          width={60}
          fixed
          dataIndex="operation"
          key="operation"
          render={(type: TransactionType) => <AssetOperationTag type={type} />}
        />

        <Table.Column
          ellipsis
          title="To"
          dataIndex="to"
          key="to"
          render={(address: string) => <Link to={`/${address}/assets`}><AddressText value={address}/></Link>}
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
