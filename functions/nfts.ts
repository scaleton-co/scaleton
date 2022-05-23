import { Handler } from '@netlify/functions';
import axios from 'axios';
import { Address } from 'ton';

const baseUrls = {
  mainnet: process.env.TON_API_MAINNET_URL,
  testnet: process.env.TON_API_TESTNET_URL,
}

function isValidAddress(address: string) {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

export const handler: Handler = async (event, context) => {
  const { address, network } = event.queryStringParameters;

  if (!isValidAddress(address)) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errorMessage: 'Invalid address provided.' }),
    };
  }

  const baseUrl = network && baseUrls[network];

  if (!baseUrl) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errorMessage: 'Invalid network.' }),
    };
  }

  const { data } = await axios.get(`${baseUrl}/v1/nft/getItemsByOwnerAddress`, {
    headers: {
      Authorization: `Bearer ${process.env.TON_API_KEY}`,
    },
    params: {
      account: event.queryStringParameters.address,
    },
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.nft_items),
  };
};
