import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  ChangeProxyOwnerRequest,
  Proxy,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Proxy Owner
 */
export default class OwnerProxyService extends Service {
  constructor() {
    super('Proxy Owner');
  }

  /**
   * change the proxy's owner
   */
  public async changeProxyOwner(req: ChangeProxyOwnerRequest): Promise<void> {
    await utilsService.showSpinner(Proxy.changeProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.changeOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
