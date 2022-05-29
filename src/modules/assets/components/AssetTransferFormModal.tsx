import { Modal, Button, Result } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { requestAssetTransfer } from '../actions';
import { createAssetSelector } from '../selectors/createAssetSelector';
import { AssetTransferForm, AssetTransferFormValues } from './AssetTransferForm';

interface AssetTransferFormModalProps {
  account: string;
  assetId: string;
  onCancel: () => void;
}

export function AssetTransferFormModal({ account, assetId, onCancel }: AssetTransferFormModalProps) {
  const selectAsset = createAssetSelector(assetId);

  const walletAdapterId = useAppSelector(state => state.wallets.common.adapterId);
  const walletSession = useAppSelector(state => state.wallets.common.session);

  const asset = useAppSelector(selectAsset);

  const [inputHasErrors, setInputHasErrors] = useState(false);
  const [input, setInput] = useState<AssetTransferFormValues|null>(null);

  const [isLoading, setLoading] = useState(false);
  const [isSucceeded, setSucceeded] = useState(false);
  const [isFailed, setFailed] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      setLoading(false);
      setSucceeded(false);
      setFailed(false);
    },
    [setLoading, setSucceeded, setFailed],
  );

  const handleFormChange = useCallback(
    (hasErrors: boolean, values: AssetTransferFormValues) => {
      setInputHasErrors(hasErrors);
      setInput(values);
    },
    [setInputHasErrors, setInput],
  );

  const handleRequestTransfer = useCallback(
    () => {
      if (!walletAdapterId) return;
      if (!assetId) return;
      if (!input) return;

      (async () => {
        try {
          setLoading(true);

          await dispatch(
            requestAssetTransfer({
              adapterId: walletAdapterId,
              session: walletSession,
              assetId,
              recipient: input.recipient,
              amount: input.amount,
              comment: input.comment ?? '',
            }),
          );

          setLoading(false);
          setSucceeded(true);
        } catch {
          setLoading(false);
          setFailed(true);
        }
      })();
    },
    [dispatch, input, walletAdapterId, walletSession, assetId],
  );

  if (!asset) {
    return <></>;
  }

  return (
    <Modal
      visible
      title={`Transfer ${asset.symbol}`}
      okText="Send"
      cancelText="Cancel"
      onCancel={onCancel}
      confirmLoading={isLoading}
      centered={isMobile}
      onOk={handleRequestTransfer}
      okButtonProps={{ disabled: !input || inputHasErrors }}
      destroyOnClose
      footer={(isSucceeded || isFailed) ? null : undefined}
    >
      {isSucceeded && (
        <Result
          status="success"
          title={`${input?.amount} ${asset.symbol} successfully sent!`}
          extra={[
            <Button key="close" onClick={onCancel}>Close</Button>,
          ]}
        />
      )}

      {isFailed && (
        <Result
          status="error"
          title="Transaction failed for some reason"
          subTitle="Please, try later or contact support."
          extra={[
            <Button key="close" onClick={onCancel}>Close</Button>,
          ]}
        />
      )}

      {(!isSucceeded && !isFailed) && (
        <AssetTransferForm
          isLoading={isLoading}
          assetSymbol={asset.symbol}
          onChange={handleFormChange}
        />
      )}
    </Modal>
  );
}
