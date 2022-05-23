import { QrcodeOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React, { useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import QRCode from 'react-qr-code';
import { TonhubCreatedSession } from 'ton-x';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { resetSession } from '../../store';

const QRCodeImage = QRCode as any;

export function TonhubConnectModal() {
  const dispatch = useAppDispatch();

  const isTonhub = useAppSelector(state => state.wallet.adapterId === 'tonhub');
  const session = useAppSelector(state => state.wallet.session as TonhubCreatedSession);
  const isWalletReady = useAppSelector(state => !!state.wallet.wallet);
  const isConnecting = useAppSelector(state => state.wallet.isConnecting);

  const handleCancel = useCallback(
    () => {
      dispatch(resetSession());
    },
    [dispatch],
  );

  const sessionLink = session?.link?.replace('ton-test://', 'https://test.tonhub.com/').replace('ton://', 'https://tonhub.com/');

  return (
    <Modal
      title="Connect Tonhub"
      visible={isTonhub && session && !isWalletReady && isConnecting}
      width={288}
      bodyStyle={{ padding: 16 }}
      centered={isMobile}
      onCancel={handleCancel}
      footer={[
        <Button key="close" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    >
      <ol style={{ paddingLeft: 16, marginBottom: 16 }}>
        <li>Open Tonhub {isMobile && (<>or click <a href={sessionLink}>here</a></>)}</li>
        <li>Touch <QrcodeOutlined /> icon in the top right corner</li>
        <li>Scan the next QR code:</li>
      </ol>

      <QRCodeImage value={session?.link} />
    </Modal>
  );
}
