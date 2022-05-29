import BN from 'bn.js';

export function generateQueryId(): BN {
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(8));

  return new BN(
    Buffer.from(randomBytes).toString('hex'),
    'hex',
  );
}
