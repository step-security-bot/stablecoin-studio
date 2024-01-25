import { DfnsSettings } from "./DfnsSettings";
import { FireblocksSettings } from "./FireblocksSettings";

export type CustodialSettings = FireblocksSettings | DfnsSettings;

// export interface FireblocksSettings {
// 	secretKey: string;
// 	apiKey: string;
// 	baseUrl: string;
// 	assetId: string;
// 	vaultAccountId: string;
// 	hederaAccountId: string;
// 	hederaAccountPublicKey: string;
// }

// export interface DfnsSettings {
// 	serviceAccountSecretKey: string;
// 	serviceAccountCredentialId: string;
// 	serviceAccountAuthToken: string;
// 	appOrigin: string;
// 	appId: string;
// 	baseUrl: string;
// 	walletId: string;
// 	hederaAccountId: string;
// 	hederaAccountPublicKey: string;
// }
