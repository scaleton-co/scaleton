import { Layout } from 'antd';
import React from 'react';

const { Header } = Layout;

export function Spoiler({ children }: { children: React.ReactNode }) {
  return (
    <Header style={{ backgroundColor: '#fadb14', lineHeight: '48px', height: 48, fontWeight: 600 }}>
      <div className="compressed">{children}</div>
    </Header>
  );
}
