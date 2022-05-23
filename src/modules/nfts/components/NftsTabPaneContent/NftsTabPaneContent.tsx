import { Button, Card, Col, Empty, PageHeader, Row, Skeleton } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getNftItems } from '../../api/getNftItems';
import { SquareImage } from '../SquareImage/SquareImage';
import './NftsTabPaneContent.scss';
import { IS_TESTNET } from '../../../ton/network';

interface NftsTabPaneContentProps {
  account: string;
}

export function NftsTabPaneContent({ account }: NftsTabPaneContentProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

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
    </div>
  );
}
