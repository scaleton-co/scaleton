import { Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export function ImpactPrice({ value }: { value: number }) {
  if (value >= 5) {
    return <Text type="danger">{value} %</Text>;
  }

  if (value >= 3) {
    return <Text type="warning">{value} %</Text>;
  }

  if (value < 1) {
    return <Text type="success">{value} %</Text>;
  }

  return <Text>{value} %</Text>;
}
