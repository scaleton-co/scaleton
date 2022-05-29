import BN from 'bn.js';
import { Address, Cell, ConfigStore, toNano, TonClient } from 'ton';
import { TonhubConnector } from 'ton-x';
import { TonhubCreatedSession, TonhubTransactionRequest } from 'ton-x/dist/connector/TonhubConnector';
import { Wallet } from '../common/Wallet';
import { WalletAdapter } from '../common/WalletAdapter';
import { WalletFeature } from '../common/WalletFeature';
import { JettonMasterContract } from '../../contracts/JettonMasterContract';
import { DEFAULT_JETTON_GAS_FEE } from '../common/constants';
import { preloadImage } from '../../common/utils/preloadImage';
import { isMainnet } from '../../common/network';
import sandboxIcon from '../common/components/WalletIcon/icons/sandbox.png';
import tonhubIcon from '../common/components/WalletIcon/icons/tonhub.png';

const TONHUB_TIMEOUT = 5 * 60 * 1000;

type TonhubSession = TonhubCreatedSession;

export class TonhubWalletAdapter implements WalletAdapter<TonhubSession> {
  readonly features: WalletFeature[] = [
    WalletFeature.TRANSFER,
    WalletFeature.JETTON_TRANSFER,
  ];

  constructor(
    private readonly tonClient: TonClient,
    private readonly tonhubConnector: TonhubConnector,
  ) {
    preloadImage(isMainnet() ? tonhubIcon : sandboxIcon);
  }

  async createSession(): Promise<TonhubSession> {
    const { location } = document;

    const session = await this.tonhubConnector.createNewSession({
      name: 'Scaleton',
      url: `${location.protocol}//${location.host}`,
    });

    // NOTE: Every wallet tries to handle ton:// links. This is needed to launch exactly Tonhub / Sandbox application.
    const sessionLink = session.link
      .replace('ton-test://', 'https://test.tonhub.com/')
      .replace('ton://', 'https://tonhub.com/');

    return {
      id: session.id,
      seed: session.seed,
      link: sessionLink,
    };
  }

  async awaitReadiness(session: TonhubSession): Promise<Wallet> {
    const state = await this.tonhubConnector.awaitSessionReady(session.id, TONHUB_TIMEOUT);

    if (state.state === 'revoked') {
      throw new Error('Connection was cancelled.');
    }

    if (state.state === 'expired') {
      throw new Error('Connection was not confirmed.');
    }

    const walletConfig = new ConfigStore(state.wallet.walletConfig);

    return {
      address: state.wallet.address,
      publicKey: walletConfig.getString('pk'),
      walletVersion: state.wallet.walletType,
    };
  }

  getWallet(session: TonhubSession): Promise<Wallet> {
    return this.awaitReadiness(session);
  }

  private async requestTransaction(session: TonhubSession, request: Omit<TonhubTransactionRequest, 'seed' | 'appPublicKey'>): Promise<void> {
    const state = await this.tonhubConnector.getSessionState(session.id);

    if (state.state !== 'ready') return;

    const response = await this.tonhubConnector.requestTransaction({
      ...request,
      seed: session.seed,
      appPublicKey: state.wallet.appPublicKey,
    });

    if (response.type === 'rejected') {
      throw new Error('Transaction was rejected.');
    }

    if (response.type === 'expired') {
      throw new Error('Transaction was expired.');
    }

    if (response.type === 'invalid_session') {
      throw new Error('Something went wrong. Refresh the page and try again.');
    }

    if (response.type === 'success') {
      // Handle successful transaction
      // const externalMessage = response.response; // Signed external message that was sent to the network
    }
  }

  isAvailable(): boolean {
    return true;
  }

  async requestTransfer(
    session: TonhubSession,
    destination: string,
    amount: string,
    comment: string,
    timeout: number,
  ): Promise<void> {
    await this.requestTransaction(
      session,
      {
        to: destination,
        value: amount,
        text: comment,
        timeout,
      },
    );
  }

  async requestJettonTransfer(
    session: TonhubSession,
    contractAddress: string,
    destination: string,
    amount: string,
    forwardPayload: string,
    requestTimeout: number,
    forwardAmount: number = 0,
    gasFee: number = DEFAULT_JETTON_GAS_FEE,
  ): Promise<void> {
    const contract = new JettonMasterContract(this.tonClient, null as any, Address.parse(contractAddress));
    const wallet = await this.getWallet(session);
    const ownerAddress = Address.parse(wallet.address);
    const jettonWallet = await contract.getJettonWallet(ownerAddress);

    const forwardComment = new Cell();

    forwardComment.bits.writeUint(0, 32);
    forwardComment.bits.writeBuffer(Buffer.from(forwardPayload));

    const transferRequest = jettonWallet.createTransferRequest({
      queryId: 0,
      amount: new BN(amount),
      destination: Address.parse(destination),
      forwardAmount: toNano(forwardAmount),
      forwardPayload: forwardComment,
    });

    await this.requestTransaction(
      session,
      {
        to: jettonWallet.address.toFriendly(),
        value: toNano(gasFee).toString(10),
        payload: transferRequest.toBoc().toString('base64'),
        timeout: requestTimeout,
      },
    );
  }
}
