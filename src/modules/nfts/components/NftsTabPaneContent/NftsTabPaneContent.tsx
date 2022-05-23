import { Button, Card, Col, Descriptions, Empty, Modal, PageHeader, Row, Skeleton } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { getNftItems } from '../../api/getNftItems';
import { SquareImage } from '../SquareImage/SquareImage';
import './NftsTabPaneContent.scss';
import { IS_TESTNET } from '../../../ton/network';
import type { NftItem } from '../../types/NftItem';

interface NftsTabPaneContentProps {
  account: string;
}

export function NftsTabPaneContent({ account }: NftsTabPaneContentProps) {
  const [assets, setAssets] = useState<NftItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [previewAssetAddress, setPreviewAssetAddress] = useState<string|null>(null);
  const previewAsset = useMemo<NftItem|null>(
    () => assets.find(asset => asset.address === previewAssetAddress) ?? null,
    [assets, previewAssetAddress],
  );

  const fetchAssets = useCallback(
    () => {
      setLoading(true);
      getNftItems(account, IS_TESTNET ? 'testnet' : 'mainnet')
        .then(items => {
          setAssets(items.filter(item => !!item.metadata))
        })
        .catch((error) => {
          console.log(error);
          // Show error
        })
        .then(() => setLoading(false));
    },
    [setAssets, setLoading, account],
  );

  useEffect(
    () => fetchAssets(),
    [setAssets, setLoading, account, fetchAssets],
  );

  return (
    <div className="nft-tab-pane-content">
      <PageHeader
        ghost={true}
        title="NFTs"
        extra={[
          <Button key="refresh" type="default" loading={isLoading} onClick={fetchAssets}>
            Refresh
          </Button>,
        ]}
      />

      {isLoading && !assets.length && (
        <Skeleton/>
      )}

      {!!assets.length && (
        <Row justify="space-between" gutter={[16, 24]}>
          {assets.map((asset, assetIndex) => (
            <Col key={assetIndex} className="gutter-row" span={8}>
              <Card
                hoverable
                onClick={() => setPreviewAssetAddress(asset.address)}
                cover={
                  <SquareImage
                    src={asset.metadata?.image!}
                    alt={asset.metadata?.name ?? 'N/A'}
                  />
                }
              >
                <Card.Meta title={asset.metadata?.name ?? 'N/A'} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!isLoading && !assets.length && (
        <div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No any NFTs available."
          />
        </div>
      )}

      {previewAsset && (
        <Modal
          title={previewAsset?.metadata?.name!}
          onCancel={() => setPreviewAssetAddress(null)}
          footer={null}
          centered={isMobile}
          bodyStyle={{ padding: 16 }}
          visible
        >
          <div>
            <SquareImage
              src={previewAsset.metadata?.image!}
              alt={previewAsset.metadata?.name ?? 'N/A'}
            />
          </div>

          <p>
            <div className="ant-descriptions-header">
              <div className="ant-descriptions-title">About Collection</div>
            </div>

            <span>{previewAsset.metadata?.description}</span>
          </p>

          <p>
            <Descriptions title="Attributes" size="small">
              {previewAsset.metadata?.attributes?.map(attribute => (
                <Descriptions.Item label={attribute.trait_type}>{attribute.value}</Descriptions.Item>
              ))}
            </Descriptions>
          </p>
        </Modal>
      )}
    </div>
  );
}
