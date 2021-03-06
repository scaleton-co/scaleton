import { Col, Layout, Row } from 'antd';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch } from './hooks';
import { NavBar } from './modules/layout/components/NavBar';
import { TonhubConnectModal } from './modules/wallets/tonhub/components/TonhubConnectModal/TonhubConnectModal';
import { TonkeeperConnectModal } from './modules/wallets/tonkeeper/components/TonkeeperConnectModal';
import { restoreSession } from './modules/wallets/common/store';
import { Connect } from './pages/Connect';
import { Jettons } from './pages/Jettons';
import { Search } from './pages/Search';
import { Trade } from './pages/Trade';
import './App.scss';

const { Footer } = Layout;

function App() {
  const dispatch = useAppDispatch();

  useEffect(
    () => {
      dispatch(restoreSession());
    },
    [dispatch],
  );

  return (
    <>
      <Layout className="main-layout">
        <NavBar/>

        <Routes>
          <Route path="/" element={<Search/>}/>
          <Route path="/assets" element={<Connect/>}/>
          <Route path="/connect" element={<Connect/>}/>
          <Route path="/dapps/dex.swap" element={<Trade/>}/>
          <Route path="/address/:address" element={<Jettons/>}/>
          <Route path="/:address/:module" element={<Jettons/>}/>
        </Routes>
      </Layout>

      <Footer>
        <div className="compressed">
          <Row>
            <Col>
              Scaleton &copy; 2022
            </Col>

            <Col flex="auto" className="links-section">
              <a target="_blank" rel="noreferrer" href="https://t.me/Scaleton">Telegram</a>
              <a target="_blank" rel="noreferrer" href="https://github.com/scaleton-co/scaleton">GitHub</a>
            </Col>
          </Row>
        </div>
      </Footer>

      <TonhubConnectModal />

      <TonkeeperConnectModal />
    </>
  );
}

export default App;
