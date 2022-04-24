import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch } from './hooks';
import { NavBar } from './modules/layout/components/NavBar';
import { initializeWallet } from './modules/ton-wallet/store';
import { Jettons } from './pages/Jettons';
import './App.scss';

const { Footer } = Layout;

function App() {
  const dispatch = useAppDispatch();

  useEffect(
    () => {
      dispatch(initializeWallet());
    },
    [dispatch],
  );

  return (
    <>
      <Layout className="main-layout">
        <NavBar/>

        <Routes>
          <Route path="/" element={<Navigate to="/assets"/>}/>
          <Route path="/assets" element={<Jettons/>}/>
          <Route path="/address/:address" element={<Jettons/>}/>
        </Routes>
      </Layout>

      <Footer>
        <div className="compressed">Scaleton &copy; 2022</div>
      </Footer>
    </>
  );
}

export default App;
