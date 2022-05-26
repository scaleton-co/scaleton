import { Space, Table, Button, Skeleton, PageHeader, Popconfirm } from 'antd';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { JettonsImportModal } from '../JettonsImportModal';
import { JettonsSendModal } from '../JettonsSendModal';
import { JettonsTransactionsModal } from '../JettonsTransactionsModal';
import { hideAsset, refreshBalances, showTransactions } from '../../store';
import { presentBalance } from '../../utils/presentBalance';
import type { AssetRef } from '../../../assets/types/AssetRef';
import './AssetsTabPaneContent.scss';

const { Column } = Table;

interface AssetsTabPaneProps {
  account: string;
}

export function AssetsTabPaneContent({ account }: AssetsTabPaneProps) {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);

  const isMyAccount = walletAddress === account;

  const [isSendJettonActive, setSendJettonActive] = useState(false);
  const [sendJettonContract, setSendJettonContract] = useState<string | null>(null);
  const [isImportJettonActive, setImportJettonActive] = useState(false);

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

  return (
    <div className="assets-tab-pane-content">
      <PageHeader
        ghost={true}
        title="Assets"
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
        <Skeleton active paragraph={{ rows: assets.length + 1 }}/>
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
            key="name"
            className="asset-name"
            render={(name: string, asset: AssetRef) => {
              return (
                <>
                  <span className="name">{name}</span>
                  <span className="symbol">{asset.symbol}</span>
                </>
              );
            }}
          />

          <Column
            title="Balance"
            key="balance"
            className="asset-balance"
            render={(_, asset: AssetRef) => (
              <>{presentBalance(balances[asset.id]?.balance ?? '0')} <span className="symbol">{asset.symbol}</span></>
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
    </div>
  );
}
