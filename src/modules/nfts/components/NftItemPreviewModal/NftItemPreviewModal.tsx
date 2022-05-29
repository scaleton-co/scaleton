import { LinkOutlined } from '@ant-design/icons';
import { Col, Modal, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { SquareImage } from '../../../common/components/SquareImage/SquareImage';
import { getNftItem } from '../../api/getNftItem';
import type { NftItem } from '../../types/NftItem';

const { Link, Text } = Typography;

interface NftItemPreviewModalProps {
  item: NftItem;
  onClose: () => void;
}

export function NftItemPreviewModal({ item, onClose }: NftItemPreviewModalProps) {
  const [fullItem, setFullItem] = useState<NftItem|null>(null);
  const [fullItemLoading, setFullItemLoading] = useState(false);

  useEffect(
    () => {
      setFullItemLoading(true);
      getNftItem(item.address)
        .then(setFullItem)
        .catch(() => {
          // Handle errors
        })
        .then(() => setFullItemLoading(false));
    },
    [item],
  );

  return (
    <Modal
      title={(
        <>{item.name!} <Text type="secondary">#{item.index}</Text></>
      )}
      onCancel={onClose}
      footer={null}
      centered={isMobile}
      bodyStyle={{ padding: 16 }}
      width={750}
      visible
    >
      <Row gutter={16}>
        <Col span={14}>
          <SquareImage
            src={item.imageUrl!}
            alt={item.name ?? 'N/A'}
            preview={!isMobile}
          />
        </Col>

        <Col span={10}>
          {item.description && (
            <div className="nft-item-section">
              <div className="title">Description</div>
              <div>{item.description}</div>
            </div>
          )}

          {item.attributes.length > 0 && (
            <div className="nft-item-section">
              <div className="title">Attributes</div>
              <Space size={6} wrap>
                {item.attributes.map(attribute => (
                  <Tag color="blue" style={{ marginRight: 0 }}><b>{attribute.traitType}:</b> {attribute.value}</Tag>
                ))}
              </Space>
            </div>
          )}

          <div className="nft-item-section">
            <Statistic
              title="Price"
              value={fullItem?.sale?.fullPrice ?? 'Not Listed'}
              valueStyle={fullItem?.sale?.fullPrice ? {} : {
                fontSize: '20px',
                color: 'rgba(0, 0, 0, 0.45)',
              }}
              suffix={fullItem?.sale?.fullPrice && 'TON'}
              loading={!fullItem?.sale && fullItemLoading}
            />

            {fullItem?.sale?.marketplace === 'get-gems' && (
              <Link
                href={`https://getgems.io/collection/${item.collectionAddress}/${item.address}`}
                target="_blank"
              >
                Getgems <LinkOutlined/>
              </Link>
            )}

            {fullItem?.sale?.marketplace === 'disintar' && (
              <Link
                href={`https://beta.disintar.io/object/${item.address}`}
                target="_blank"
              >
                Disintar <LinkOutlined/>
              </Link>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
}
