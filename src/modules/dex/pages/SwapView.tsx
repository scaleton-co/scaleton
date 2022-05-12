import {
  DownCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, InputNumber, Row, Select, Skeleton, Tooltip } from 'antd';
import Big from 'big.js';
import React, { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { ConfirmSwapModal } from '../components/ConfirmSwapModal';
import { ImpactPrice } from '../components/ImpactPrice';
import { RefreshLink } from '../components/RefreshLink';
import { selectAvailableDestinations } from '../selectors/selectAvailableDestinations';
import { selectAvailableSources } from '../selectors/selectAvailableSources';
import { selectDestinationAmountOut } from '../selectors/selectDestinationAmountOut';
import { selectDestinationSymbol } from '../selectors/selectDestinationSymbol';
import { selectImpactPrice } from '../selectors/selectImpactPrice';
import { selectSourceSymbol } from '../selectors/selectSourceSymbol';
import {
  estimateSwap,
  refreshBalances,
  refreshPrices,
  requestSwap,
  reset,
  setDestination,
  setSource,
  setSourceAmount,
} from '../store';
import './SwapView.scss';

const { Option } = Select;

export function SwapForm() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const availableSources = useAppSelector(selectAvailableSources);
  const availableDestinations = useAppSelector(selectAvailableDestinations);

  const slippage = useAppSelector(state => state.dex.swap.slippage);
  const sourceId = useAppSelector(state => state.dex.swap.sourceId);
  const sourceSymbol = useAppSelector(selectSourceSymbol);
  const sourceAmountIn = useAppSelector(state => state.dex.swap.sourceAmountIn);
  const sourceBalance = useAppSelector(state => state.dex.swap.sourceBalance);
  const sourceBalanceLoading = useAppSelector(state => state.dex.swap.sourceBalanceLoading);
  const destinationId = useAppSelector(state => state.dex.swap.destinationId);
  const destinationSymbol = useAppSelector(selectDestinationSymbol);
  const destinationAmountOut = useAppSelector(selectDestinationAmountOut);
  const destinationBalance = useAppSelector(state => state.dex.swap.destinationBalance);
  const destinationBalanceLoading = useAppSelector(state => state.dex.swap.destinationBalanceLoading);

  const estimatePrice = useAppSelector(state => state.dex.swap.currentPrice);
  const estimatePriceLoading = useAppSelector(state => state.dex.swap.currentPriceLoading);

  const impactPrice = useAppSelector(selectImpactPrice);

  const swapAvailable = sourceId
    && destinationSymbol
    && sourceAmountIn && new Big(sourceAmountIn).gt(0)
    && impactPrice && impactPrice < 15;

  const handleChangeSource = useCallback(
    async (assetId) => {
      await dispatch(setSource(assetId));
      await dispatch(refreshBalances());
      await dispatch(refreshPrices());
    },
    [dispatch],
  );

  const handleChangeDestination = useCallback(
    async (assetId) => {
      await dispatch(setDestination(assetId));
      await dispatch(refreshBalances());
      await dispatch(refreshPrices());
    },
    [dispatch],
  );

  const handleSourceAmount = useCallback(
    (amount) => dispatch(setSourceAmount(amount)),
    [dispatch],
  );

  const handleRefreshPrices = useCallback(
    () => dispatch(refreshPrices()),
    [dispatch],
  );

  const handleSwap = useCallback(
    () => {
      dispatch(requestSwap());
    },
    [dispatch],
  );

  useEffect(
    () => {
      (async () => {
        await dispatch(reset());
        await dispatch(refreshBalances());
        await dispatch(refreshPrices());
      })();
    },
    [dispatch],
  );

  useEffect(
    () => {
      dispatch(estimateSwap());
    },
    [dispatch, sourceId, sourceAmountIn, destinationId],
  );

  return (
    <>
      <Card
        style={{
          border: '1px solid #ddd',
          borderRadius: 6,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ margin: '0 0 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '18pt' }}>Swap</h1>
          <span style={{ color: '#656565' }}>Swap your tokens with ease</span>
        </div>

        <Divider style={{ margin: '16px 0' }}/>

        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item label="From" style={{ marginBottom: 12 }}>
            <Row gutter={16}>
              <Col flex="auto" style={{ display: 'flex' }}>
                <InputNumber<string>
                  style={{ flex: 1 }}
                  size="large"
                  min="0"
                  max={sourceBalance}
                  step="0.000000001"
                  value={sourceAmountIn}
                  onChange={handleSourceAmount}
                  stringMode
                  controls={false}
                />
              </Col>
              <Col flex="none">
                <Select
                  style={{ width: 120 }}
                  size="large"
                  value={sourceId}
                  onChange={handleChangeSource}
                  showSearch
                >
                  {availableSources.map(asset => (
                    <Option key={asset.id} value={asset.id}>{asset.symbol}</Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {sourceBalance && (
              <Row style={{ marginTop: 8 }}>
                <Col style={{ lineHeight: '30px' }}>
                  {sourceBalanceLoading ? (
                    <Skeleton title={false} active paragraph={{ rows: 1, width: 150 }}/>
                  ) : (
                    <>Balance: {sourceBalance}</>
                  )}
                </Col>
              </Row>
            )}
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <DownCircleOutlined style={{ fontSize: 24 }}/>
          </div>

          <Form.Item label="To" style={{ marginBottom: 0 }}>
            <Row gutter={16}>
              <Col flex="auto" style={{ display: 'flex' }}>
                <InputNumber<string>
                  style={{ flex: 1 }}
                  size="large"
                  step="0.000000001"
                  stringMode
                  controls={false}
                  readOnly={true}
                  value={destinationAmountOut}
                />
              </Col>
              <Col flex="none">
                <Select
                  style={{ width: 120 }}
                  size="large"
                  showSearch
                  value={destinationId}
                  onChange={handleChangeDestination}
                  disabled={!availableDestinations.length}
                >
                  {availableDestinations.map(asset => (
                    <Option key={asset.id} value={asset.id}>{asset.symbol}</Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {destinationBalance && (
              <Row style={{ marginTop: 8 }}>
                <Col style={{ lineHeight: '30px' }}>
                  {destinationBalanceLoading ? (
                    <Skeleton title={false} active paragraph={{ rows: 1, width: 150 }}/>
                  ) : (
                    <>Balance: {destinationBalance}</>
                  )}
                </Col>
              </Row>
            )}
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}/>

          <Row>
            <Col>Price</Col>
            <Col flex="auto" style={{ textAlign: 'right' }}>
              {(sourceId && destinationSymbol && estimatePrice)
                ? `${estimatePrice} ${sourceSymbol} per ${destinationSymbol}`
                : '-'}

              <RefreshLink
                isLoading={estimatePriceLoading}
                onClick={handleRefreshPrices}
                style={{ marginLeft: 8 }}
              />
            </Col>
          </Row>

          <Row>
            <Col>Slippage Tolerance</Col>
            <Col flex="auto" style={{ textAlign: 'right' }}>
              {slippage} %
              <Tooltip title="Currently, this option is not available.">
                <SettingOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </Col>
          </Row>

          <div className="swap-button-section">
            <Button
              type="primary"
              size="large"
              disabled={!swapAvailable}
              onClick={handleSwap}
            >
              Swap
            </Button>
          </div>

          <Divider style={{ margin: '16px 0' }}/>

          <Row>
            <Col>Price Impact</Col>
            <Col flex="auto" style={{ textAlign: 'right' }}>
              {impactPrice ? (
                <ImpactPrice value={impactPrice}/>
              ) : '- %'}
            </Col>
          </Row>
        </Form>
      </Card>

      <ConfirmSwapModal/>
    </>
  );
}

export function SwapView() {
  return (
    <div style={{ margin: '50px auto' }}>
      <div style={{ width: 350 }}>
        <SwapForm/>
      </div>
    </div>
  );
}
