import React from 'react';
import tonWalletIconPath from './icons/ton-wallet.png';
import tonhubIconPath from './icons/tonhub.png';
import './WalletIcon.scss';

export function WalletIcon({ wallet }: { wallet: 'ton-wallet' | 'tonhub' }) {
  switch (wallet) {
    case 'ton-wallet':
      return (
        <img className="wallet-icon" src={tonWalletIconPath} alt="TON Wallet"/>
      );

    case 'tonhub':
      return (
        <img className="wallet-icon" src={tonhubIconPath} alt="Tonhub"/>
      );

    default:
      return null;
  }
}
