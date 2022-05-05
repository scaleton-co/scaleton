import { Layout } from 'antd';
import React from 'react';
import './Spoiler.scss';

const { Header } = Layout;

export function Spoiler({ children }: { children: React.ReactNode }) {
  return (
    <Header className="spoiler">
      <div className="compressed">{children}</div>
    </Header>
  );
}
