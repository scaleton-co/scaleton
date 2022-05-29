import { HistoryOutlined, SendOutlined } from '@ant-design/icons';
import { Button, PageHeader, Popconfirm, Skeleton, Space, Table, Tooltip } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { ImportJettonModal } from '../ImportJettonModal';
import { AssetTransferFormModal } from '../AssetTransferFormModal';
import { AssetHistoryModal } from '../AssetHistoryModal';
import { fetchHistory, hideAsset, refreshBalances } from '../../actions';
import { presentBalance } from '../../../jettons/utils/presentBalance';
import { selectWalletAddress } from '../../../wallets/common/selectors/selectWalletAddress';
import type { AssetRef } from '../../types';
import { AssetType } from '../../types';
import { selectWalletFeatures } from '../../../wallets/common/selectors/selectWalletFeatures';
import { WalletFeature } from '../../../wallets/common/WalletFeature';
import { selectWalletName } from '../../../wallets/common/selectors/selectWalletName';
import './AssetsTabPaneContent.scss';

const { Column } = Table;

interface AssetsTabPaneProps {
  account: string;
}

export function AssetsTabPaneContent({ account }: AssetsTabPaneProps) {
  const walletName = useAppSelector(selectWalletName);
  const walletAddress = useAppSelector(selectWalletAddress);
  const walletFeatures = useAppSelector(selectWalletFeatures);

  const isMyAccount = walletAddress === account;

  const [transferAssetId, setTransferAssetId] = useState<string | null>(null);
  const [isImportJettonActive, setImportJettonActive] = useState(false);

  const assets = useAppSelector(state => state.assets.assets);
  const allBalances = useAppSelector(state => state.assets.balances);
  const balancesLoading = useAppSelector(state => state.assets.balancesLoading);
  const balances = useMemo(
    () => account ? allBalances[account] : {},
    [account, allBalances],
  );

  const dispatch = useAppDispatch();

  const handleRefresh = useCallback(
    () => {
      if (!account) return;
      dispatch(refreshBalances(account));
    },
    [dispatch, account],
  );

  const showSendAsset = useCallback(
    (assetId: string) => setTransferAssetId(assetId),
    [setTransferAssetId],
  );

  const [transactionsAssetId, setTransactionsAssetId] = useState<string | null>(null);

  const showAssetTransactions = useCallback(
    (assetId: string) => {
      dispatch(fetchHistory({ account, assetId }));
      setTransactionsAssetId(assetId);
    },
    [dispatch, setTransactionsAssetId, account],
  );

  const displayImportJettonModal = useCallback(
    () => setImportJettonActive(true),
    [setImportJettonActive],
  );

  const closeImportJettonModal = useCallback(
    () => setImportJettonActive(false),
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

  useEffect(
    () => {
      if (!account) return;

      closeImportJettonModal();
      setTransferAssetId(null);
      setTransactionsAssetId(null);

      dispatch(refreshBalances(account));
    },
    [dispatch, account, closeImportJettonModal, setTransferAssetId, setTransactionsAssetId],
  );

  return (
    <div className="assets-tab-pane-content">
      <PageHeader
        ghost={true}
        title="Assets"
        extra={[
          <Button key="import" type="link" onClick={displayImportJettonModal}>
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
            render={(name: string, asset: AssetRef) => (
              <>
                <span className="name">{name}</span>
                <span className="symbol">{asset.symbol}</span>
              </>
            )}
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
              <Space size={8} key={index}>
                <Button type="link" onClick={() => showAssetTransactions(asset.id)}>
                  <HistoryOutlined />
                </Button>

                {isMyAccount && walletName && (
                  <>
                    {asset.type === AssetType.NATIVE && (
                      walletFeatures.includes(WalletFeature.TRANSFER)
                        ? (
                          <Button
                            type="link"
                            onClick={() => showSendAsset(asset.id)}
                            disabled={!walletFeatures.includes(WalletFeature.TRANSFER)}
                          >
                            <SendOutlined />
                          </Button>
                        ) : (
                          <Tooltip
                            placement="leftTop"
                            title={`Currently ${walletName} does not support operations with native coins.`}
                          >
                            <Button type="link" disabled>
                              <SendOutlined />
                            </Button>
                          </Tooltip>
                        )
                    )}

                    {asset.type === AssetType.JETTON && (
                      walletFeatures.includes(WalletFeature.JETTON_TRANSFER)
                        ? (
                          <Button type="link" onClick={() => showSendAsset(asset.id)}>
                            <SendOutlined />
                          </Button>
                        ) : (
                          <Tooltip
                            placement="leftTop"
                            title={`Currently ${walletName} does not support operations with jettons.`}
                          >
                            <Button type="link" disabled>
                              <SendOutlined />
                            </Button>
                          </Tooltip>
                        )
                    )}
                  </>
                )}

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

      {isImportJettonActive && (
        <ImportJettonModal
          onImport={handleImportJetton}
          onCancel={closeImportJettonModal}
        />
      )}

      {transferAssetId && (
        <AssetTransferFormModal
          account={account}
          assetId={transferAssetId}
          onCancel={() => setTransferAssetId(null)}
        />
      )}

      {transactionsAssetId && (
        <AssetHistoryModal
          account={account}
          assetId={transactionsAssetId}
          onClose={() => setTransactionsAssetId(null)}
        />
      )}
    </div>
  );
}
