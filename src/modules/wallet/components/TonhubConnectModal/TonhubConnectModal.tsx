import { QrcodeOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { useCallback } from 'react';
import { isAndroid, isIOS, isMobile } from 'react-device-detect';
import { QRCode } from 'react-qrcode-logo';
import { TonhubCreatedSession } from 'ton-x';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { resetSession } from '../../store';
import tonhubIconPath from '../WalletIcon/icons/tonhub.png';
import sandboxIconPath from '../WalletIcon/icons/sandbox.png';
import { isSandbox } from '../../../ton/network';

export function TonhubConnectModal() {
  const dispatch = useAppDispatch();

  const isTonhub = useAppSelector(state => state.wallet.adapterId === 'tonhub');
  const session = useAppSelector(state => state.wallet.session as TonhubCreatedSession);
  const isWalletReady = useAppSelector(state => !!state.wallet.wallet);
  const isConnecting = useAppSelector(state => state.wallet.isConnecting);

  const applicationName = isSandbox() ? 'Sandbox' : 'Tonhub';
  const applicationIcon = isSandbox() ? sandboxIconPath : tonhubIconPath;

  const isMobileAppSupported = isIOS || isAndroid;

  const handleCancel = useCallback(
    () => {
      dispatch(resetSession());
    },
    [dispatch],
  );

  return (
    <Modal
      title={`Connect ${applicationName}`}
      visible={isTonhub && !isMobileAppSupported && session && !isWalletReady && isConnecting}
      width={288}
      bodyStyle={{ padding: 16 }}
      centered={isMobile}
      onCancel={handleCancel}
      footer={null}
    >
      <ol style={{ paddingLeft: 16, marginBottom: 16 }}>
        <li>Open <b>{applicationName}</b> application</li>
        <li>Touch <b><QrcodeOutlined /></b> icon in the top right corner</li>
        <li>Scan the next QR code:</li>
      </ol>

      <QRCode
        value={session?.link}
        size={256}
        quietZone={0}
        logoImage={applicationIcon}
        removeQrCodeBehindLogo
        eyeRadius={[
          [10, 10, 0, 10], // top/left eye
          [10, 10, 10, 0], // top/right eye
          [10, 0, 10, 10], // bottom/left
        ]}
        fgColor="#002457"
      />
    </Modal>
  );
}
