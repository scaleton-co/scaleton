import { WalletOutlined } from '@ant-design/icons';
import { Button, Col, Dropdown, Layout, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../hooks';
import { truncateAddress } from '../../jettons/utils/truncateAddress';
import { IS_TESTNET } from '../../ton/network';
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
            <Link to="/"><img src={ScaletonIcon} alt="Scaleton"/> Scaleton {IS_TESTNET && (
              <span className="testnet-badge">testnet</span>)}</Link>
          </div>
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
