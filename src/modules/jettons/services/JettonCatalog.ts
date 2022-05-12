import MAINNET_JETTONS from '../../../static/assets/mainnet.yaml';
import TESTNET_JETTONS from '../../../static/assets/testnet.yaml';
import { IS_TESTNET } from '../../ton/network';
import type { Jetton } from '../types/Jetton';

class JettonCatalog {
  public contracts: Jetton[];

  constructor(standardContracts: Jetton[], private readonly chainSuffix: string) {
    this.contracts = [...standardContracts];

    const customContracts = localStorage.getItem(`jettons:contracts:${this.chainSuffix}`);

    if (customContracts) {
      this.contracts.push(...JSON.parse(customContracts));
    }
  }

  importJetton(address: string, name: string, symbol?: string) {
    const jetton: Jetton = {
      address,
      name,
      symbol,
      custom: true,
    };

    this.contracts = [...this.contracts, jetton];

    localStorage.setItem(
      `jettons:contracts:${this.chainSuffix}`,
      JSON.stringify(this.contracts.filter(contract => !!contract.custom)),
    );
  }
}

export const jettonCatalog = new JettonCatalog(
  IS_TESTNET ? TESTNET_JETTONS : MAINNET_JETTONS,
  IS_TESTNET ? 'testnet' : 'mainnet',
);
