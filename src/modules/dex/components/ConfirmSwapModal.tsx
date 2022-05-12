import { CheckCircleOutlined, StopOutlined, SyncOutlined, WalletOutlined } from '@ant-design/icons';
import { Divider, Modal, Timeline } from 'antd';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectWalletName } from '../../wallet/selectors/selectWalletName';
import { SwapStatus } from '../enums/SwapStatus';
import { selectDestinationSymbol } from '../selectors/selectDestinationSymbol';
import { selectSourceSymbol } from '../selectors/selectSourceSymbol';
import { cancelSwap } from '../store';
import { ProgressStep } from './ProgressStep';
import './ConfirmSwapModal.scss';

export function ConfirmSwapModal() {
  const walletName = useAppSelector(selectWalletName);
  const sourceSymbol = useAppSelector(selectSourceSymbol);
  const destinationSymbol = useAppSelector(selectDestinationSymbol);
  const status: SwapStatus = useAppSelector(state => state.dex.swap.status);
  const receivedAmount = useAppSelector(state => state.dex.swap.receivedAmount);

  const isFailed = status >= SwapStatus.CONFIRM_FAILED;
  const isConfirmed = status >= SwapStatus.CONFIRMED && status <= SwapStatus.RECEIVED;
  const isConfirmFailed = status === SwapStatus.CONFIRM_FAILED;
  const isSent = status >= SwapStatus.SENT && status <= SwapStatus.RECEIVED;
  const isReceived = status >= SwapStatus.RECEIVED && status <= SwapStatus.RECEIVED;

  const dispatch = useAppDispatch();

  const handleClose = useCallback(
    () => {
      dispatch(cancelSwap());
    },
    [dispatch],
  );

  return (
    <Modal
      title={`Swapping ${sourceSymbol} to ${destinationSymbol}`}
      visible={status >= SwapStatus.CONFIRMING}
      width={340}
      footer={false}
      className="confirm-swap-modal"
      onCancel={handleClose}
    >
      <div style={{ textAlign: 'center', margin: '42px 0' }}>
        <div className="swap-status-icon">
          {isReceived ? (
            <CheckCircleOutlined />
          ) : isConfirmed ? (
            <SyncOutlined spin />
          ) : isFailed ? (
            <StopOutlined />
          ) : (
            <WalletOutlined className="pulsing-wallet-icon" />
          )}
        </div>

        <p style={{ margin: '24px 0 -24px', minHeight: 24 }}>
          {isReceived ? (
            <>You received {receivedAmount} {destinationSymbol}.</>
          ) : isConfirmed ? (
            <></>
          ) : isFailed ? (
            <>Unfortunately transaction was failed.</>
          ) : (
            <>Confirm the transaction in <b>{walletName}</b></>
          )}
        </p>
      </div>

      <Divider />

      <Timeline style={{ margin: '0 auto' }}>
        <ProgressStep
          status={isConfirmed ? 'done' : isConfirmFailed ? 'failed' : 'pending'}
          idleText="Wait for confirmation"
          pendingText="Waiting for your confirmation"
          doneText="Transaction is confirmed"
          failedText="Transaction was not confirmed"
        />

        <ProgressStep
          status={isSent ? 'done' : (isConfirmed ? 'pending' : 'idle')}
          idleText={`Send ${sourceSymbol} to DEX`}
          pendingText={`Sending ${sourceSymbol} to DEX`}
          doneText={`${sourceSymbol} was sent to DEX`}
          failedText={`${sourceSymbol} was not sent to DEX`}
        />

        <ProgressStep
          status={isReceived ? 'done' : (isSent ? 'pending' : 'idle')}
          idleText={`Receive ${destinationSymbol} from DEX`}
          pendingText={`Receiving ${destinationSymbol} from DEX`}
          doneText={`${destinationSymbol} was received from DEX`}
          failedText={`${destinationSymbol} was not received from DEX`}
          last
        />
      </Timeline>
    </Modal>
  );
}
