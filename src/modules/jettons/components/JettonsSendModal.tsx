import { Modal, Form, Input, Button, Result } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TonWeb from 'tonweb';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { sendJettons } from '../store';

interface CollectionCreateFormProps {
  account: string;
  jetton: string | null;
  visible: boolean;
  onCancel: () => void;
}

export function JettonsSendModal({ account, jetton, visible, onCancel }: CollectionCreateFormProps) {
  const jettonContract = useAppSelector(state => state.jettons.contracts.find(contract => contract.address === jetton));
  const jettonWallet = useAppSelector(state => jetton !== null ? state.jettons.balances[account][jetton] : null);

  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [isSucceeded, setSucceeded] = useState(false);
  const [isFailed, setFailed] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      if (!visible) {
        setLoading(false);
        form.resetFields();
      }
    },
    [visible, form],
  );

  const handleSend = useCallback(
    () => {
      if (!jettonWallet) return;

      form
        .validateFields()
        .then(async values => {
          setLoading(true);
          await dispatch(
            sendJettons({
              jettonWallet: jettonWallet.wallet,
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
          console.log('Validate Failed:', info);
        });
    },
    [dispatch, jettonWallet, account, form],
  );

  const amount = useMemo(
    () => form.getFieldValue('amount'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, isFailed, isSucceeded],
  );

  if (!jettonContract) {
    return <></>;
  }

  return (
    <Modal
      visible={visible}
      title={`Send ${jettonContract.symbol}`}
      okText="Send"
      cancelText="Cancel"
      onCancel={onCancel}
      confirmLoading={isLoading}
      onOk={handleSend}
      footer={(isSucceeded || isFailed) ? null : undefined}
    >
      {isSucceeded && (
        <Result
          status="success"
          title={`${amount} ${jettonContract.symbol} successfully sent!`}
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
            <Input type="number" defaultValue={0} addonAfter={jettonContract.symbol} disabled={isLoading}/>
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
