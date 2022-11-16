import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK, PauseStableCoinRequest } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class PauseStableCoinService extends Service {
  constructor() {
    super('Pause Stable Coin');
  }

  /**
   * give supplier role
   */
  public async pauseStableCoin(req: PauseStableCoinRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.pauseStableCoin(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.pauseCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
