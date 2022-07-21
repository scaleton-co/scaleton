import { Tag } from 'antd';
import React from 'react';
import './AssetOperationTag.scss';
import { TransactionType } from '../../types';

interface AssetOperationTagProps {
  type: TransactionType;
}

export function AssetOperationTag({ type }: AssetOperationTagProps) {
  switch (type) {
    case 'in':
      return <Tag color="green" className="asset-operation-tag">IN</Tag>

    case 'out':
      return <Tag color="red" className="asset-operation-tag">OUT</Tag>;

    case 'mint':
      return <Tag color="cyan" className="asset-operation-tag">MINT</Tag>;

    case 'burn':
      return <Tag color="volcano" className="asset-operation-tag">BURN</Tag>;

    default:
      return <Tag color="grey" className="asset-operation-tag">UNKNOWN</Tag>;
  }
}
