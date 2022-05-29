import React from 'react';
import tonWalletIconPath from './icons/ton-wallet.png';
import tonkeeperIconPath from './icons/tonkeeper.svg';
import tonhubIconPath from './icons/tonhub.png';
import sandboxIconPath from './icons/sandbox.png';
import './WalletIcon.scss';

export function WalletIcon({ wallet }: { wallet: 'ton-wallet' | 'tonkeeper' | 'tonhub' | 'sandbox' }) {
  switch (wallet) {
    case 'ton-wallet':
      return (
        <img className="wallet-icon" src={tonWalletIconPath} alt="TON Wallet"/>
      );

    case 'tonkeeper':
      return (
        <img className="wallet-icon" src={tonkeeperIconPath} alt="Tonkeeper"/>
      );

    case 'tonhub':
      return (
        <img className="wallet-icon" src={tonhubIconPath} alt="Tonhub"/>
      );

    case 'sandbox':
      return (
        <img className="wallet-icon" src={sandboxIconPath} alt="Sandbox"/>
      );

    default:
      return null;
  }
}
