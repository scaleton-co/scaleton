import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Space, Table, Layout, Button, Skeleton, PageHeader, message, Popconfirm } from 'antd';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { ConnectWalletView } from '../../wallet/pages/ConnectWalletView';
import { Address } from '../components/Address/Address';
import { JettonsImportModal } from '../components/JettonsImportModal';
import { JettonsSendModal } from '../components/JettonsSendModal';
import { JettonsTransactionsModal } from '../components/JettonsTransactionsModal';
import { hideAsset, refreshBalances, showTransactions } from '../store';
import { presentBalance } from '../utils/presentBalance';
import type { AssetRef } from '../../assets/types/AssetRef';
import './JettonWalletView.scss';

const { Column } = Table;
const { Content } = Layout;

export function JettonWalletView() {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);
  const { address: account } = useParams();

  const isMyAccount = walletAddress === account;

  const [isSendJettonActive, setSendJettonActive] = useState(false);
  const [sendJettonContract, setSendJettonContract] = useState<string | null>(null);
  const [isImportJettonActive, setImportJettonActive] = useState(false);

  const jettons = useAppSelector(state => state.jettons.contracts);
  const assets = useAppSelector(state => state.jettons.assets);
  const allBalances = useAppSelector(state => state.jettons.balances);
  const balancesLoading = useAppSelector(state => state.jettons.balancesLoading);
  const balances = useMemo(
    () => account ? allBalances[account] : {},
    [account, allBalances],
  );

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      if (!account) return;

      dispatch(refreshBalances(account));
    },
    [dispatch, account],
  );

  const handleRefresh = useCallback(
    () => {
      if (!account) return;
      dispatch(refreshBalances(account));
    },
    [dispatch, account],
  );

  const showSendAsset = useCallback(
    (assetId: string) => {
      setSendJettonActive(true);
      setSendJettonContract(assetId);
    },
    [setSendJettonActive],
  );

  const [isJettonTransactionActive, setJettonTransactionsActive] = useState(false);
  const [jettonTransactionWallet, setJettonTransactionsWallet] = useState<string | null>(null);

  const showAssetTransactions = useCallback(
    (assetId: string) => {
      dispatch(showTransactions(assetId));
      setJettonTransactionsActive(true);
      setJettonTransactionsWallet(assetId);
    },
    [dispatch, setJettonTransactionsActive],
  );

  const closeJettonTransactions = useCallback(
    () => {
      setJettonTransactionsActive(false);
      setJettonTransactionsWallet(null);
    },
    [setJettonTransactionsActive, setJettonTransactionsWallet],
  );

  const openImportJetton = useCallback(
    () => {
      setImportJettonActive(true);
    },
    [setImportJettonActive],
  );

  const closeImportJetton = useCallback(
    () => {
      setImportJettonActive(false);
    },
    [setImportJettonActive],
  );

  const handleImportJetton = useCallback(
    () => {
      if (!account) return;

      setImportJettonActive(false);
      dispatch(refreshBalances(account));
    },
    [setImportJettonActive, dispatch, account],
  );

  const handleHideAsset = useCallback(
    (assetId: string) => {
      dispatch(hideAsset(assetId));
    },
    [dispatch],
  );

  const handleAddressClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!account) return;
      navigator.clipboard.writeText(account);
      message.info('Address saved to clipboard.');
    },
    [account],
  );

  if (!account) {
    return (
      <ConnectWalletView />
    );
  }

  return (
    <Content className="jetton-wallet-view compressed">
      <PageHeader
        ghost={true}
        title={(
          <>
            <Address value={account}/>
            {/*{isMyAccount ? 'My Wallet' : }*/}
            {/*{isMyAccount ? 'My Wallet' : <Address value={account}/>}*/}
            <a href="#" onClick={handleAddressClick} style={{ marginLeft: 6, fontSize: '12pt', color: 'rgba(0, 0, 0, 0.85)' }}><CopyOutlined /></a>
            {isMyAccount && (
              <span className="my-account-badge">(it's you)</span>
            )}
          </>
        )}
        extra={[
          <Button key="import" type="link" onClick={openImportJetton}>
            Import Jetton
          </Button>,
          <Button key="refresh" type="default" loading={balances && balancesLoading} onClick={handleRefresh}>
            Refresh
          </Button>,
        ]}
      />

      {!balances && (
        <Skeleton active paragraph={{ rows: jettons.length + 1 }}/>
      )}

      {balances && (
        <Table
          dataSource={assets}
          loading={balancesLoading}
          rowKey={(asset: AssetRef) => asset.id}
          pagination={false}
        >
          <Column
            title="Name"
            dataIndex="name"
            key="age"
            render={(name: string, asset: AssetRef) => {
              return (
                <>{name} {asset.url && (<a href={asset.url} target="_blank" rel="noreferrer"><LinkOutlined/></a>)}</>
              );
            }}
          />

          <Column
            title="Balance"
            key="balance"
            render={(_, asset: AssetRef) => (
              <>{presentBalance(balances[asset.id]?.balance ?? '0')} {asset.symbol}</>
            )}
          />

          <Column
            width={300}
            title="Action"
            key="action"
            render={(_, asset: AssetRef, index) => (
              <Space size="middle" key={index}>
                {isMyAccount && (
                  <Button type="link" onClick={() => showSendAsset(asset.id)}>Send</Button>
                )}

                <Button type="link" onClick={() => showAssetTransactions(asset.id)}>Transactions</Button>

                {asset.isCustom && (
                  <Popconfirm
                    title="Are you sure？"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleHideAsset(asset.id)}
                  >
                    <a href="#">Hide</a>
                  </Popconfirm>
                )}
              </Space>
            )}
          />
        </Table>
      )}

      <JettonsImportModal
        visible={isImportJettonActive}
        onCancel={closeImportJetton}
        onImport={handleImportJetton}
      />

      <JettonsSendModal
        account={account}
        assetId={sendJettonContract}
        visible={isSendJettonActive}
        onCancel={() => {
          setSendJettonActive(false);
        }}
      />

      <JettonsTransactionsModal
        account={account}
        jettonWallet={jettonTransactionWallet}
        visible={isJettonTransactionActive}
        onClose={closeJettonTransactions}
      />
    </Content>
  );
}

