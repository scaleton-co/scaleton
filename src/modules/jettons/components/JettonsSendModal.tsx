import { Modal, Form, Input, Button, Result } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TonWeb from 'tonweb';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { assetCatalog } from '../../assets/services';
import { sendAssets } from '../store';

interface CollectionCreateFormProps {
  account: string;
  assetId: string | null;
  visible: boolean;
  onCancel: () => void;
}

export function JettonsSendModal({ account, assetId, visible, onCancel }: CollectionCreateFormProps) {
  const walletAdapterId = useAppSelector(state => state.wallet.adapterId);
  const walletSession = useAppSelector(state => state.wallet.session);

  const asset = useAppSelector(() => assetId ? assetCatalog.getById(assetId) : null);
  // const jettonContract = useAppSelector(state => state.jettons.contracts.find(contract => contract.address === assetId));
  const jettonWallet = useAppSelector(state => assetId !== null ? state.jettons.balances[account][assetId] : null);

  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [isSucceeded, setSucceeded] = useState(false);
  const [isFailed, setFailed] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      if (!visible) {
        setLoading(false);
        setSucceeded(false);
        setFailed(false);
        form.resetFields();
      }
    },
    [visible, form],
  );

  const handleSend = useCallback(
    () => {
      if (!jettonWallet) return;
      if (!walletAdapterId) return;
      if (!assetId) return;

      form
        .validateFields()
        .then(async values => {
          setLoading(true);
          await dispatch(
            sendAssets({
              adapterId: walletAdapterId,
              session: walletSession,
              assetId,
              response: account,
              recipient: values.recipient,
              amount: values.amount,
              comment: values.comment ?? '',
            }),
          );

          setLoading(false);
          setSucceeded(true);
        })
        .catch(info => {
          setLoading(false);
          setFailed(true);
        });
    },
    [dispatch, jettonWallet, account, form, walletAdapterId, walletSession, assetId],
  );

  const amount = useMemo(
    () => form.getFieldValue('amount'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, isFailed, isSucceeded],
  );

  if (!asset) {
    return <></>;
  }

  return (
    <Modal
      visible={visible}
      title={`Send ${asset.symbol}`}
      okText="Send"
      cancelText="Cancel"
      onCancel={onCancel}
      confirmLoading={isLoading}
      onOk={handleSend}
      destroyOnClose
      footer={(isSucceeded || isFailed) ? null : undefined}
    >
      {isSucceeded && (
        <Result
          status="success"
          title={`${amount} ${asset.symbol} successfully sent!`}
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
        <Form
          form={form}
          layout="vertical"
          initialValues={{ modifier: 'public' }}
          requiredMark="optional"
        >
          <Form.Item
            name="recipient"
            label="Recipient Address"
            rules={[
              {
                required: true,
                message: 'Please input the valid address of recipient!',
                validator(rule, value, callback) {
                  if (rule.required && !value) {
                    callback('Recipient address is required.');
                    return;
                  }

                  if (TonWeb.Address.isValid(value)) {
                    callback();
                  } else {
                    callback('Invalid TON address.');
                  }
                },
              }
            ]}
          >
            <Input autoFocus disabled={isLoading}/>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please input the amount of tokens!' }]}
          >
            <Input
              type="number"
              defaultValue={0}
              addonAfter={asset.symbol}
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ max: 80, message: 'Comment is too long.' }]}
          >
            <Input.TextArea disabled={isLoading}/>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
