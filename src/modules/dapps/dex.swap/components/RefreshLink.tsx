import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import React from 'react';

interface RefreshLinkProps {
  isLoading: boolean;
  onClick: () => void;
}

export function RefreshLink({ isLoading, onClick, ...rest }: RefreshLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const icon = isLoading
    ? <LoadingOutlined/>
    : <ReloadOutlined/>;

  return <a onClick={onClick} {...rest}>{icon}</a>
}
