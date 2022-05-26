import { WalletOutlined } from '@ant-design/icons';
import { Button, Col, Dropdown, Layout, Menu, Row, Tag, Tooltip } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../hooks';
import { truncateAddress } from '../../jettons/utils/truncateAddress';
import { isMainnet, isSandbox, isTestnet } from '../../ton/network';
import { ConnectWalletButton } from '../../wallet/components/ConnectWalletButton/ConnectWalletButton';
import telegramIcon from '../icons/telegram.svg';
import { NavBarWalletMenu } from './NavBarWalletMenu';
import ScaletonIcon from './ScaletonIcon.svg';
import './NavBar.scss';

const { Header } = Layout;

export function NavBar() {
  const wallet = useAppSelector(state => state.wallet.wallet);

  return (
    <Header className="header">
      <Row>
        <Col flex="none">
          <div className="navbar-logo">
            <Link to="/">
              <img src={ScaletonIcon} alt="Scaleton"/> <span className="logo-text">Scaleton</span>

              {' '}

              {isTestnet() && (
                <span className="network-badge testnet">testnet</span>
              )}

              {isSandbox() && (
                <span className="network-badge sandbox">sandbox</span>
              )}
            </Link>
          </div>
        </Col>

        <Col flex="auto">
          <Menu
            theme="dark"
            mode="horizontal"
            style={{
              background: '#002457',
            }}
            selectedKeys={[]}
            items={[
              {
                key: 'assets',
                label: (
                  <Link to="/assets">My Wallet</Link>
                ),
              },
              isMainnet() ? ({
                key: 'dapps.dex.swap',
                label: (
                  <Tooltip placement="bottomRight" title="Currently, DEX is available only in testnet.">
                    DEX <Tag color="#f50" style={{ marginLeft: 7 }}>NEW</Tag>
                  </Tooltip>
                ),
                style: {
                  cursor: 'not-allowed',
                },
              }) : ({
                key: 'dapps.dex.swap',
                label: (
                  <Link to="/dapps/dex.swap">
                    DEX <Tag color="#f50" style={{ marginLeft: 7 }}>NEW</Tag>
                  </Link>
                ),
              }),
            ]}
          />
        </Col>

        <Col flex="auto" className="links">
          <Button
            ghost
            type="link"
            href="https://t.me/Scaleton"
            icon={<img src={telegramIcon} className="navbar-icon" alt="@Scaleton"/>}
          >
            {' '}
          </Button>
        </Col>

        <Col flex="none" className="wallet-button-section">
          {wallet ? (
            <Dropdown overlay={<NavBarWalletMenu/>} placement="bottomRight" trigger={['click']}>
              <Button type="primary" icon={<WalletOutlined/>}>
                {truncateAddress(wallet.address)}
              </Button>
            </Dropdown>
          ) : (
            <ConnectWalletButton theme="dark" />
          )}
        </Col>
      </Row>
    </Header>
  );
}
