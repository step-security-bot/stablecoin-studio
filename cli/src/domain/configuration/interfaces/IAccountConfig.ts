import { IPrivateKey } from './IPrivateKey.js';
import { IImportedToken } from './IImportedToken';

export type AccountConfig = SelfCustodialAccountConfig | FireblocksAccountConfig | DfnsAccountConfig;

interface IAccountConfig {
  accountId: string;
  network: string;
  alias: string;
  importedTokens?: IImportedToken[];
}

export interface SelfCustodialAccountConfig extends IAccountConfig {
  privateKey: IPrivateKey;
}

//* Custodial account config
export interface FireblocksAccountConfig extends IAccountConfig {
  apiSecretKey: string;
  apiKey: string;
  baseUrl: string;
  assetId: string;
  vaultAccountId: string;
}

export interface DfnsAccountConfig extends IAccountConfig {
  authorizationToken: string;
  credentialId: string;
  privateKeyPath: string;
  appOrigin: string;
  appId: string;
  testUrl: string;
  walletId: string;
}
