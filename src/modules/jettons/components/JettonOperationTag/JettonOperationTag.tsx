import { Tag } from 'antd';
import React from 'react';
import { JettonOperation } from '../../enums/JettonOperation';
import './JettonOperationTag.scss';

interface JettonOperationTagProps {
  type: string | JettonOperation;
  from: string | null;
}

export function JettonOperationTag({ type, from }: JettonOperationTagProps) {
  switch (type) {
    case 'in':
    case JettonOperation.INTERNAL_TRANSFER:
      return from
        ? <Tag color="green" className="jetton-operation-tag">IN</Tag>
        : <Tag color="cyan" className="jetton-operation-tag">MINT</Tag>;

    case 'out':
    case JettonOperation.TRANSFER:
      return <Tag color="red" className="jetton-operation-tag">OUT</Tag>;

    case 'mint':
      return <Tag color="cyan" className="jetton-operation-tag">MINT</Tag>;

    default:
      return <Tag color="grey" className="jetton-operation-tag">UNKNOWN</Tag>;
  }
}
