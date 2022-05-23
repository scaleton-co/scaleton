import { CopyOutlined } from '@ant-design/icons';
import { Layout, PageHeader, message, Tabs } from 'antd';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../hooks';
import { ConnectWalletView } from '../../wallet/pages/ConnectWalletView';
import { Address } from '../components/Address/Address';
import { AssetsTabPaneContent } from '../components/AssetsTabPaneContent/AssetsTabPaneContent';
import { NftsTabPaneContent } from '../../nfts/components/NftsTabPaneContent/NftsTabPaneContent';
import './JettonWalletView.scss';

const { Content } = Layout;

export function JettonWalletView() {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);
  const { address: account, module } = useParams();
  const navigate = useNavigate();
  const activeTab = module === 'nfts' ? 'nfts' : 'assets';

  const isMyAccount = walletAddress === account;

  const handleAddressClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!account) return;
      navigator.clipboard.writeText(account);
      message.info('Address saved to clipboard.');
    },
    [account],
  );

  const handleChangeTab = useCallback(
    (tab: string) => navigate(`/${account}/${tab}`),
    [navigate, account],
  );

  if (!account) {
    return (
      <ConnectWalletView/>
    );
  }

  return (
    <Content className="jetton-wallet-view compressed">
      <PageHeader
        ghost={true}
        title={(
          <>
            <Address value={account}/>
            <a href="#" onClick={handleAddressClick}
               style={{ marginLeft: 6, fontSize: '12pt', color: 'rgba(0, 0, 0, 0.85)' }}><CopyOutlined/></a>
            {isMyAccount && (
              <span className="my-account-badge">(it's you)</span>
            )}
          </>
        )}
      />

      <Tabs type="card" defaultActiveKey={activeTab} onChange={handleChangeTab}>
        <Tabs.TabPane tab="Assets" key="assets">
          <AssetsTabPaneContent account={account}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="NFTs" key="nfts">
          <NftsTabPaneContent account={account}/>
        </Tabs.TabPane>
      </Tabs>
    </Content>
  );
}
