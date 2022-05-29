import { Form, Input } from 'antd';
import Big from 'big.js';
import React, { useCallback } from 'react';
import TonWeb from 'tonweb';

export interface AssetTransferFormValues {
  recipient: string;
  amount: string;
  comment: string;
}

interface AssetTransferFormProps {
  isLoading: boolean;
  assetSymbol: string;
  onChange: (hasErrors: boolean, values: AssetTransferFormValues) => void;
}

export function AssetTransferForm({ isLoading, assetSymbol, onChange }: AssetTransferFormProps) {
  const [form] = Form.useForm<AssetTransferFormValues>();

  const handleChange = useCallback(
    () => {
      form
        .validateFields()
        .then(values => onChange(false, values))
        .catch(error => onChange(true, error.values));
    },
    [form, onChange],
  );

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      onChange={handleChange}
      initialValues={{
        amount: 0,
      }}
    >
      <Form.Item
        name="recipient"
        label="Recipient Address"
        rules={[
          {
            required: true,
            message: 'Please input the valid address of recipient!',
            async validator(rule, value) {
              if (rule.required && !value) {
                throw new Error('Recipient address is required.');
              }

              if (!TonWeb.Address.isValid(value)) {
                throw new Error('Invalid TON address.');
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
        rules={[
          {
            required: true,
            message: 'Please input the amount of tokens!',
            async validator(rule, value) {
              if (!!value && new Big(value).gt(0)) {
                return;
              }

              throw new Error('Empty amount');
            },
          },
        ]}
      >
        <Input
          type="number"
          addonAfter={assetSymbol}
          disabled={isLoading}
        />
      </Form.Item>

      <Form.Item
        name="comment"
        label="Comment"
        rules={[
          { max: 80, message: 'Comment is too long.' },

        ]}
      >
        <Input.TextArea disabled={isLoading}/>
      </Form.Item>
    </Form>
  );
}
