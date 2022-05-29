import { Button, Card, Col, Empty, PageHeader, Row, Skeleton } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SquareImage } from '../../../common/components/SquareImage/SquareImage';
import { NftItemPreviewModal } from '../NftItemPreviewModal/NftItemPreviewModal';
import { getNftItemsByOwner } from '../../api/getNftItemsByOwner';
import type { NftItem } from '../../types/NftItem';
import './NftsTabPaneContent.scss';

interface NftsTabPaneContentProps {
  account: string;
}

export function NftsTabPaneContent({ account }: NftsTabPaneContentProps) {
  const [assets, setAssets] = useState<NftItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [previewAssetAddress, setPreviewAssetAddress] = useState<string | null>(null);
  const previewAsset = useMemo<NftItem | null>(
    () => assets.find(asset => asset.address === previewAssetAddress) ?? null,
    [assets, previewAssetAddress],
  );

  const fetchAssets = useCallback(
    () => {
      setLoading(true);
      getNftItemsByOwner(account)
        .then(items => setAssets(items))
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
                    src={asset.imageUrl!}
                    alt={asset.name ?? 'N/A'}
                  />
                }
              >
                <Card.Meta title={asset.name ?? 'N/A'}/>
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
        <NftItemPreviewModal
          item={previewAsset}
          onClose={() => setPreviewAssetAddress(null)}
        />
      )}
    </div>
  );
}
