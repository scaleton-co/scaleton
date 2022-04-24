import { LinkOutlined } from '@ant-design/icons';
import { Space, Table, Layout, Button, Skeleton, PageHeader, message } from 'antd';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Address } from '../components/Address/Address';
import { ConnectWalletView } from '../components/ConnectWalletView/ConnectWalletView';
import { JettonsImportModal } from '../components/JettonsImportModal';
import { JettonsSendModal } from '../components/JettonsSendModal';
import { JettonsTransactionsModal } from '../components/JettonsTransactionsModal';
import { refreshBalances, showTransactions } from '../store';
import { presentBalance } from '../utils/presentBalance';
import type { Jetton } from '../types/Jetton';
import './JettonWalletView.scss';

const { Column } = Table;
const { Content } = Layout;

export function JettonWalletView() {
  const currentAccount = useAppSelector(state => state.wallet.wallets[0]?.address);
  const { address } = useParams();

  const account = address || currentAccount;
  const isMyAccount = !address;

  const [isSendJettonActive, setSendJettonActive] = useState(false);
  const [sendJettonContract, setSendJettonContract] = useState<string | null>(null);
  const [isImportJettonActive, setImportJettonActive] = useState(false);

  const jettons = useAppSelector(state => state.jettons.contracts);
  const allBalances = useAppSelector(state => state.jettons.balances);
  const balancesLoading = useAppSelector(state => state.jettons.balancesLoading);
  const balances = useMemo(
    () => allBalances[account],
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
      dispatch(refreshBalances(account));
    },
    [dispatch, account],
  );

  const showSendJetton = useCallback(
    (token: Jetton) => {
      setSendJettonActive(true);
      setSendJettonContract(token.address);
    },
    [setSendJettonActive],
  );

  const [isJettonTransactionActive, setJettonTransactionsActive] = useState(false);
  const [jettonTransactionWallet, setJettonTransactionsWallet] = useState<string | null>(null);

  const showJettonTransactions = useCallback(
    (jetton: Jetton) => {
      const jettonWallet = balances[jetton.address];

      dispatch(showTransactions(jettonWallet.wallet));
      setJettonTransactionsActive(true);
      setJettonTransactionsWallet(jettonWallet.wallet);
    },
    [dispatch, setJettonTransactionsActive, balances],
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

  const handleAddressClick = useCallback(
    () => {
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

  if (address && address === currentAccount) {
    return (
      <Navigate to="/assets" />
    );
  }

  return (
    <Content className="jetton-wallet-view compressed">
      <PageHeader
        ghost={true}
        title={isMyAccount ? 'My Wallet' : <span onClick={handleAddressClick} className="clickable-address"><Address value={account}/></span>}
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
          dataSource={jettons}
          loading={balancesLoading}
          rowKey={(jetton: Jetton) => jetton.address}
          pagination={false}
        >
          <Column
            title="Name"
            dataIndex="name"
            key="age"
            render={(name: string, jetton: Jetton) => {
              return (
                <>{name} {jetton.url && (<a href={jetton.url} target="_blank" rel="noreferrer"><LinkOutlined/></a>)}</>
              );
            }}
          />

          <Column
            title="Balance"
            key="balance"
            render={(_, jetton: Jetton) => (
              <>{presentBalance(balances[jetton.address]?.balance ?? '0')} {jetton.symbol}</>
            )}
          />

          <Column
            width={300}
            title="Action"
            key="action"
            render={(_, jetton: Jetton, index) => (
              <Space size="middle" key={index}>
                {isMyAccount && (
                  <Button type="link" onClick={() => showSendJetton(jetton)}>Send</Button>
                )}
                <Button type="link" onClick={() => showJettonTransactions(jetton)}>Transactions</Button>
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
        jetton={sendJettonContract}
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

