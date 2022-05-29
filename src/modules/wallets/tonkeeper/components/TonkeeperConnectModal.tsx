import { QrcodeOutlined, SyncOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { isAndroid, isIOS, isMobile } from 'react-device-detect';
import { QRCode } from 'react-qrcode-logo';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { TonkeeperSession } from '../TonkeeperWalletAdapter';
import { resetSession } from '../../common/store';
import tonkeeperIconPath from '../../common/components/WalletIcon/icons/tonkeeper.svg';
import './TonkeeperConnectModal.scss';

export function TonkeeperConnectModal() {
  const dispatch = useAppDispatch();

  const isTonkeeper = useAppSelector(state => state.wallets.common.adapterId === 'tonkeeper');
  const session = useAppSelector(state => state.wallets.common.session as TonkeeperSession);
  const isWalletReady = useAppSelector(state => !!state.wallets.common.wallet);
  const isConnecting = useAppSelector(state => state.wallets.common.isConnecting);

  const isMobileAppSupported = isIOS || isAndroid;

  const handleCancel = useCallback(
    () => {
      dispatch(resetSession());
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!isTonkeeper || !session || isWalletReady || !isConnecting || !isMobileAppSupported) {
        return;
      }

      window.location.assign(session.link);
    },
    [isTonkeeper, session, isWalletReady, isConnecting, isMobileAppSupported],
  );

  if (!isTonkeeper || !session || isWalletReady || !isConnecting) {
    return null;
  }

  return (
    <Modal
      className="tonkeeper-connect-modal"
      title="Connect Tonkeeper"
      visible
      centered={isMobile}
      onCancel={handleCancel}
      footer={null}
    >
      {isMobileAppSupported ? (
        <>
          <ol>
            <li>Open <a href={session.link}><b>Tonkeeper</b></a> application</li>
            <li>Confirm the authentication request</li>
          </ol>

          <div className="confirmation-status">
            <SyncOutlined spin/>
          </div>
        </>
      ) : (
        <>
          <ol>
            <li>Open <b>Tonkeeper</b> application</li>
            <li>Touch <b><QrcodeOutlined/></b> icon in the top right corner</li>
            <li>Scan the next QR code:</li>
          </ol>

          <QRCode
            value={session?.link}
            size={256}
            quietZone={0}
            logoImage={tonkeeperIconPath}
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
