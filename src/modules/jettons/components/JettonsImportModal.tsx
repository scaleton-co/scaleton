import { Form, Input, Modal } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TonWeb from 'tonweb';
import { useAppDispatch } from '../../../hooks';
import { jettonV1 } from '../contracts/JettonV1';
import { importJetton } from '../store';
import { IPFS_GATEWAY_PREFIX } from '../utils/ipfs';

export function JettonsImportModal({ visible, onCancel, onImport }: {
  visible: boolean;
  onImport: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();

  const [address, setAddress] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');

  const [content, setContent] = useState<any>(null);
  const [isContractValid, setContractValid] = useState(false);

  const isValidAddress = useMemo(() => TonWeb.Address.isValid(address), [address]);
  const nameFromContent = useMemo(() => content?.name ?? null, [content]);
  const symbolFromContent = useMemo(() => content?.symbol ?? content?.name ?? null, [content]);

  const handleAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddress(event.target.value);
    },
    [setAddress],
  );

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    [setName],
  );

  const handleSymbolChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSymbol(event.target.value);
    },
    [setSymbol],
  );

  const handleOk = useCallback(
    () => {
      dispatch(
        importJetton({
          address,
          name: nameFromContent || name,
          symbol: symbolFromContent || symbol,
        }),
      );

      onImport();
    },
    [onImport, dispatch, address, nameFromContent, name, symbolFromContent, symbol],
  );

  const resetForm = useCallback(
    () => {
      setAddress('');
      setName('');
      setSymbol('');
    },
    [setAddress, setName, setSymbol],
  );

  useEffect(
    () => {
      resetForm();
    },
    [visible, resetForm],
  );

  useEffect(
    () => {
      if (!TonWeb.Address.isValid(address)) {
        setContent(null);
        return;
      }

      setLoading(true);
      setContractValid(false);
      jettonV1.getData(address)
        .then(jettonData => {
          setContractValid(true);

          return fetch(jettonData.contentUri.replace(/^ipfs:\/\//, IPFS_GATEWAY_PREFIX));
        })
        .then(response => response.json())
        .then((response: any) => {
          setContent(response);
          setName('');
          setSymbol('');
          setLoading(false);
        })
        .catch(() => {
          setContent(null);
          setLoading(false);
        });
    },
    [address],
  );

  return (
    <Modal
      title="Import Jetton"
      visible={visible}
      okText="Import"
      width={420}
      okButtonProps={{
        disabled: (!!address && (!isContractValid || !isValidAddress)) || (!name && !nameFromContent) || (!symbol && !symbolFromContent),
      }}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item name="jettonAddress" label="Contract Address">
          <Input.Search
            placeholder="EQBW1X-nBd_hQ1gCfM1z..."
            onChange={handleAddressChange}
            value={address}
            disabled={isLoading}
            loading={isLoading}
            status={(address && (!isContractValid || !isValidAddress)) ? 'error' : undefined}
            enterButton={false}
          />
        </Form.Item>

        <Form.Item label="Name">
          <Input
            placeholder="The Open Network"
            onChange={handleNameChange}
            value={nameFromContent ?? name}
            disabled={isLoading || nameFromContent}
          />
        </Form.Item>

        <Form.Item label="Symbol">
          <Input
            placeholder="TON"
            onChange={handleSymbolChange}
            value={symbolFromContent ?? symbol}
            disabled={isLoading || symbolFromContent}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
