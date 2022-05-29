import { QrcodeOutlined, SyncOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { isAndroid, isIOS, isMobile } from 'react-device-detect';
import { QRCode } from 'react-qrcode-logo';
import { TonhubCreatedSession } from 'ton-x';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { resetSession } from '../../../common/store';
import tonhubIconPath from '../../../common/components/WalletIcon/icons/tonhub.png';
import sandboxIconPath from '../../../common/components/WalletIcon/icons/sandbox.png';
import { isSandbox } from '../../../../common/network';
import './TonhubConnectModal.scss';

export function TonhubConnectModal() {
  const dispatch = useAppDispatch();

  const isTonhub = useAppSelector(state => state.wallets.common.adapterId === 'tonhub');
  const session = useAppSelector(state => state.wallets.common.session as TonhubCreatedSession);
  const isWalletReady = useAppSelector(state => !!state.wallets.common.wallet);
  const isConnecting = useAppSelector(state => state.wallets.common.isConnecting);

  const applicationName = isSandbox() ? 'Sandbox' : 'Tonhub';
  const applicationIcon = isSandbox() ? sandboxIconPath : tonhubIconPath;

  const isMobileAppSupported = isIOS || isAndroid;

  const handleCancel = useCallback(
    () => {
      dispatch(resetSession());
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!isTonhub || !session || isWalletReady || !isConnecting || !isMobileAppSupported) {
        return;
      }

      window.location.assign(session.link);
    },
    [isTonhub, session, isWalletReady, isConnecting, isMobileAppSupported],
  );

  if (!isTonhub || !session || isWalletReady || !isConnecting) {
    return null;
  }

  return (
    <Modal
      className="tonhub-connect-modal"
      title={`Connect ${applicationName}`}
      visible
      centered={isMobile}
      onCancel={handleCancel}
      footer={null}
    >
      {isMobileAppSupported ? (
        <>
          <ol>
            <li>Open <a href={session.link}><b>{applicationName}</b></a> application</li>
            <li>Confirm the authentication request</li>
          </ol>

          <div className="confirmation-status">
            <SyncOutlined spin />
          </div>
        </>
      ) : (
        <>
          <ol>
            <li>Open <b>{applicationName}</b> application</li>
            <li>Touch <b><QrcodeOutlined/></b> icon in the top right corner</li>
            <li>Scan the next QR code:</li>
          </ol>

          <QRCode
            value={session?.link}
            size={256}
            quietZone={0}
            logoImage={applicationIcon}
            removeQrCodeBehindLogo
            eyeRadius={[
              [10, 10, 0, 10],
              [10, 10, 10, 0],
              [10, 0, 10, 10],
            ]}
            fgColor="#002457"
          />
        </>
      )}
    </Modal>
  );
}
