/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AcceptFactoryProxyOwnerRequest,
  ChangeFactoryProxyOwnerRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Proxy Owner
 */
export default class OwnerFactoryProxyService extends Service {
  constructor() {
    super('Factory proxy Owner');
  }

  /**
   * change the proxy's owner of the factory
   */
  public async changeFactoryProxyOwner(
    req: ChangeFactoryProxyOwnerRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Proxy.changeFactoryProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.changeOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * accept the proxy's owner of the Factory
   */
  public async acceptFactoryProxyOwner(
    req: AcceptFactoryProxyOwnerRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Proxy.acceptFactoryProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.acceptOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * cancel the proxy's owner of the Factory
   */
  public async cancelFactoryProxyOwner(
    currentFactoryId: string,
  ): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();

    const changeFactoryProxyOwnerRequest = new ChangeFactoryProxyOwnerRequest({
      factoryId: currentFactoryId,
      targetId: configAccount.accountId,
    });

    await this.changeFactoryProxyOwner(changeFactoryProxyOwnerRequest);

    const acceptFactoryProxyOwnerRequest = new AcceptFactoryProxyOwnerRequest({
      factoryId: currentFactoryId,
    });

    await this.acceptFactoryProxyOwner(acceptFactoryProxyOwnerRequest);
  }
}
