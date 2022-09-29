/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig';
import { INetworkConfig } from '../../../../src/domain/configuration/interfaces/INetworkConfig';
import { StableCoinList } from '../../../../src/domain/stablecoin/StableCoinList';
import { utilsService } from '../../../../src/index';

console.log = jest.fn();
console.error = jest.fn();
console.clear = jest.fn();

jest.mock('inquirer', () => ({
  prompt: (): any => {
    return 'Mocked';
  },
}));

const account: IAccountConfig = {
  accountId: '0.0.48450590',
  privateKey:
    '302e020100300506032b657004220420b5745b7d095b8272720b7723ecf585b82569e8d8177910ec2b39c399d764ea04',
  network: 'testnet',
  alias: 'Test',
};

describe(`Testing UtilitiesService class`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should can initialize and get SDK', async () => {
    let errorMessage: string;
    try {
      const sdk = utilsService.getSDK();
      expect(sdk).not.toBeNull();
    } catch (err) {
      errorMessage = err.message;
    } finally {
      expect(errorMessage).toBe('SDK not initialized');
    }

    await utilsService.initSDK('testnet');

    const sdk = utilsService.getSDK();
    expect(sdk).not.toBeNull();
  });

  it('Should can set and get current account', () => {
    let errorMessage: string;
    try {
      const account = utilsService.getCurrentAccount();
      expect(account).not.toBeNull();
    } catch (err) {
      errorMessage = err.message;
    } finally {
      expect(errorMessage).toBe('Account not initialized');
    }

    utilsService.setCurrentAccount(account);

    const currentAccount = utilsService.getCurrentAccount();
    expect(currentAccount).not.toBeNull();
  });

  it('Should can set and get current network', () => {
    let errorMessage: string;
    try {
      const account = utilsService.getCurrentNetwork();
      expect(account).not.toBeNull();
    } catch (err) {
      errorMessage = err.message;
    } finally {
      expect(errorMessage).toBe('Network not initialized');
    }

    const network: INetworkConfig = {
      name: 'network_test',
      mirrorNodeUrl: '127.0.0.1',
      chainId: 0,
      consensusNodes: [],
    };

    utilsService.setCurrentNetwotk(network);

    const currentNetwork = utilsService.getCurrentNetwork();
    expect(currentNetwork).not.toBeNull();
  });

  it('Should create instance', async () => {
    await utilsService.showBanner();

    expect(utilsService).not.toBeNull();
  });

  it('Should display error', () => {
    utilsService.showError('Testing error');

    expect(console.error).toHaveBeenCalledWith('Testing error');
  });

  it('Should display breakLine', () => {
    utilsService.breakLine();

    expect(console.log).toHaveBeenCalledWith('\n');
  });

  it('Should clean terminal and display banner', async () => {
    await utilsService.cleanAndShowBanner();

    expect(console.log).toHaveBeenCalled();
  });

  it('Should mask private accounts', async () => {
    const accounts: IAccountConfig[] = [account];

    const maskAccounts = utilsService.maskPrivateAccounts(accounts);

    expect(maskAccounts[0].privateKey).not.toBe(account.privateKey);
  });

  it('Should draw table of stable coins', async () => {
    utilsService.drawTableListStableCoin();
    expect(console.log).toHaveBeenCalled();

    let stableCoinList: StableCoinList[] = [];
    utilsService.drawTableListStableCoin(stableCoinList);

    expect(console.log).toHaveBeenCalledWith(
      'There are no stable coins available at this time.',
    );

    stableCoinList = stableCoinList.concat({
      id: '0.0.12345',
      symbol: 'TestCoin',
    });

    utilsService.drawTableListStableCoin(stableCoinList);

    expect(console.log).toHaveBeenCalled();
  });

  it('Should password ask', async () => {
    const passwordAsk = await utilsService.defaultPasswordAsk('Question');

    expect(passwordAsk).not.toBe(null);
  });

  it('Should confirm ask', async () => {
    const confirmAsk = await utilsService.defaultConfirmAsk('Question', true);

    expect(confirmAsk).not.toBe(null);
  });

  it('Should multiple ask', async () => {
    const multipleAsk = await utilsService.defaultMultipleAsk(
      'Question',
      ['Choice 1, Choice 2'],
      true,
      'testnet',
      '0.0.12345',
      '0.0.98765',
    );

    expect(multipleAsk).not.toBe(null);
  });

  it('Should single ask', async () => {
    const singleAsk = await utilsService.defaultSingleAsk(
      'Question',
      'Default value',
    );

    expect(singleAsk).not.toBe(null);
  });
});
