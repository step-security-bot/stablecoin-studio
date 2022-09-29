import CreateStableCoinService from '../../../../src/app/service/stablecoin/CreateStableCoinService';
import { utilsService } from '../../../../src/index';

describe('Testing SCCreate class', () => {
  const createStableCoinService = new CreateStableCoinService();

  it('Should render', async () => {
    await utilsService.initSDK('testnet');
    await utilsService.setCurrentAccount({
      accountId: '0.0.48450590',
      privateKey:
        '302e020100300506032b657004220420b5745b7d095b8272720b7723ecf585b82569e8d8177910ec2b39c399d764ea04',
      network: 'testnet',
      alias: 'Test',
    });

    expect(createStableCoinService).not.toBe(null);
  });

  it('Should create Stable Coin', () => {
    jest.useFakeTimers();
    const stableCoin = {
      name: 'SC test',
      symbol: 'SC',
      autoRenewAccount: '0.0.0',
      decimals: 3,
      initialSupply: BigInt(100),
      supplyType: 'INFINITE',
    };
    createStableCoinService.createStableCoin(stableCoin, false);
    expect(createStableCoinService).not.toBe(null);
  });
});
