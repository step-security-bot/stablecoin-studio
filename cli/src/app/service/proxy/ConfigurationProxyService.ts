import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  Proxy,
  GetProxyConfigRequest,
  ProxyConfigurationViewModel,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Create Stable Coin Service
 */
export default class ConfigurationProxyService extends Service {
  constructor() {
    super('Proxy Configuration');
  }

  public async getProxyconfiguration(
    id: string,
  ): Promise<ProxyConfigurationViewModel> {
    let proxyConfig: ProxyConfigurationViewModel;

    await utilsService.showSpinner(
      Proxy.getProxyConfig(
        new GetProxyConfigRequest({
          tokenId: id,
        }),
      ).then((response) => (proxyConfig = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.proxyConfigCompleted') + '\n',
      },
    );

    return proxyConfig;
  }
}
