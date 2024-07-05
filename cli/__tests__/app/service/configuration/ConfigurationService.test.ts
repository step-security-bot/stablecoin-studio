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

import { rimraf } from 'rimraf';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import {
  utilsService,
  configurationService,
  setConfigurationService,
} from '../../../../src/index.js';
// import Language from '../../../../src/domain/language/Language.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
// import { LogOptions } from '@hashgraph/stablecoin-npm-sdk';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

// const language: Language = new Language();
const DEFAULT_ACCOUNTS = [
  '0.0.123456',
  '0.0.456789',
  '0.0.654321',
  '0.0.987654',
];
const DEFAULT_CONTRACT_IDS = ['0.0.0', '0.0.1', '0.0.22', '0.0.333'];
const NETWORKS = {
  test: 'testnet',
  preview: 'previewnet',
  main: 'mainnet',
};
const CONFIG_FILE_PATH = `hsca-config_test.yaml`;

const CONFIG_MOCK: IConfiguration = {
  defaultNetwork: 'testnet',
  networks: [],
  accounts: [
    {
      accountId: DEFAULT_ACCOUNTS[0],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'test account',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[1],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'New account alias',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[2],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'another test account',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[3],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'test',
      importedTokens: [],
    },
  ],
  logs: {
    path: './logs',
    level: 'ERROR',
  },
  rpcs: [
    {
      name: 'HASHIO',
      network: NETWORKS.test,
      baseUrl: 'https://testnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: NETWORKS.preview,
      baseUrl: 'https://previewnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: NETWORKS.main,
      baseUrl: 'https://mainnet.hashio.io/api',
      selected: true,
    },
  ],
  factories: [
    {
      id: DEFAULT_CONTRACT_IDS[0],
      network: NETWORKS.test,
    },
    {
      id: DEFAULT_CONTRACT_IDS[1],
      network: NETWORKS.preview,
    },
  ],
  mirrors: [
    {
      name: 'HEDERA',
      network: NETWORKS.test,
      baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: 'previewnet',
      baseUrl: 'https://previewnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: NETWORKS.main,
      baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
  ],
};

const mocks: Record<string, jest.SpyInstance> = {};

describe('Configuration Service', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.showSpinner = jest
      .spyOn(utilsService, 'showSpinner')
      .mockImplementation();
    //! mocks.log = jest.spyOn(console, 'log').mockImplementation(); <<-- Restore this line
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'warn').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    mocks.cleanAndShowBanner = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation();
    mocks.showMessage = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();
    // Not fixed, only defined
    mocks.defaultSingleAsk = jest.spyOn(utilsService, 'defaultSingleAsk');
    mocks.defaultConfirmAsk = jest.spyOn(utilsService, 'defaultConfirmAsk');
    mocks.defaultMultipleAsk = jest.spyOn(utilsService, 'defaultMultipleAsk');
    mocks.getDefaultConfigurationPath = jest.spyOn(
      configurationService,
      'getDefaultConfigurationPath',
    );
  });
  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(CONFIG_FILE_PATH);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Init configuration', () => {
    beforeAll(() => {
      mocks.getDefaultConfigurationPath.mockReturnValue(CONFIG_FILE_PATH);
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });
    it('should init configuration with no initial configuration or a file path', async () => {
      //* 🗂️ Arrange
      // Write configuration mock to file
      fs.writeFileSync(CONFIG_FILE_PATH, yaml.dump(''));
      const initConfigurationMock = jest
        .spyOn(setConfigurationService, 'initConfiguration')
        .mockResolvedValueOnce(null);
      //* 🎬 Act
      await configurationService.init();
      //* 🕵️ Assert
      expect(initConfigurationMock).toHaveBeenCalledTimes(1);
      expect(initConfigurationMock).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should init configuration with path', async () => {
      //* 🗂️ Arrange
      const setConfigFromConfigFileMock = jest
        .spyOn(configurationService, 'setConfigFromConfigFile')
        .mockReturnValueOnce(CONFIG_MOCK);
      const initConfigurationMock = jest
        .spyOn(setConfigurationService, 'initConfiguration')
        .mockResolvedValueOnce(null);
      //* 🎬 Act
      await configurationService.init(undefined, CONFIG_FILE_PATH);
      //* 🕵️ Assert
      const config = configurationService.getConfiguration();
      expect(setConfigFromConfigFileMock).toHaveBeenCalledTimes(1);
      expect(initConfigurationMock).toHaveBeenCalledTimes(0);
      expect(config).toStrictEqual(CONFIG_MOCK);
    });
    it('should init configuration with path and override account', async () => {
      //* 🗂️ Arrange
      const setConfigFromConfigFileMock = jest
        .spyOn(configurationService, 'setConfigFromConfigFile')
        .mockReturnValueOnce(CONFIG_MOCK);
      const setConfigurationServiceMock = jest
        .spyOn(setConfigurationService, 'initConfiguration')
        .mockResolvedValueOnce(null);
      //* 🎬 Act
      await configurationService.init(
        {
          // Override account id with ZERO account
          accounts: [
            { accountId: DEFAULT_ACCOUNTS[0], ...CONFIG_MOCK.accounts[0] },
          ],
        },
        CONFIG_FILE_PATH,
      );
      //* 🕵️ Assert
      const config = configurationService.getConfiguration();
      expect(setConfigFromConfigFileMock).toHaveBeenCalledTimes(1);
      expect(setConfigurationServiceMock).toHaveBeenCalledTimes(0);
      expect(config.accounts[0].accountId).toStrictEqual(DEFAULT_ACCOUNTS[0]);
    });
  });
  // it('should get configuration and log configuration', async () => {
  //   const conf: IConfiguration = configurationService.getConfiguration();

  //   expect(configurationService).not.toBeNull();
  //   expect(conf.defaultNetwork).toStrictEqual(configurationMock.defaultNetwork);
  //   // expect(conf.accounts).toStrictEqual(configurationMock.accounts);
  //   expect(conf.factories).toStrictEqual(configurationMock.factories);
  //   expect(conf.mirrors).toStrictEqual(configurationMock.mirrors);
  //   expect(conf.rpcs).toStrictEqual(configurationMock.rpcs);
  //   expect(conf.logs).toStrictEqual(configurationMock.logs);
  //   expect(configurationService).not.toBeNull();

  //   const logConf: LogOptions = configurationService.getLogConfiguration();

  //   expect(logConf.level).toStrictEqual(configurationMock.logs.level);
  // });

  // it('should show full configuration', async () => {
  //   jest.spyOn(console, 'dir');

  //   configurationService.showFullConfiguration();

  //   expect(configurationService).not.toBeNull();
  //   expect(console.dir).toHaveBeenCalledTimes(1);
  // });

  // it('should check the configurated factory id', async () => {
  //   jest.spyOn(utilsService, 'showWarning');

  //   configurationService.logFactoryIdWarning(
  //     '0.0.13570',
  //     'factory',
  //     'testnet',
  //     [
  //       {
  //         id: '0.0.13579',
  //         network: 'testnet',
  //       },
  //     ],
  //   );

  //   expect(configurationService).not.toBeNull();
  //   expect(utilsService.showWarning).toHaveBeenCalledTimes(1);
  // });
});
