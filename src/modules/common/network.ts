export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  SANDBOX = 'sandbox',
}

export function getNetwork(host: string): Network {
  switch(host) {
    case 'testnet.scaleton.co':
    case 'testnet.scaleton.io':
    case 'localhost:3001':
      return Network.TESTNET;

    case 'sandbox.scaleton.co':
    case 'sandbox.scaleton.io':
    case 'localhost:3002':
      return Network.SANDBOX;

    case 'scaleton.co':
    case 'scaleton.io':
    case 'localhost:3003':
    default:
      return Network.MAINNET;
  }
}

export const CURRENT_NETWORK = getNetwork(document.location.host);

export const isMainnet = () => CURRENT_NETWORK === Network.MAINNET;
export const isTestnet = () => CURRENT_NETWORK === Network.TESTNET;
export const isSandbox = () => CURRENT_NETWORK === Network.SANDBOX;
