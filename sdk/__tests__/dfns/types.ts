/*
 *
 * Hedera Stablecoin SDK
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

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type AssetAccount = {
	tags?: string[];
	externalId?: string;
	orgId: string;
	id: string;
	status: string;
	address?: string;
	publicKey?: string;
	publicKeyId?: string;
	assetSymbol: string;
	name: string;
	dateCreated: string;
	dateUpdate: string;
	authorizations?: {
		kind: string;
		entityId: string;
		permission: string;
	}[];
};
export type ClientData = {
	type: 'key.get' | 'webauthn.get';
	challenge: string;
	origin: string;
	crossOrigin: boolean;
};

export type UserActionSignatureChallenge = {
	supportedCredentialKinds: {
		kind: 'Fido2' | 'Key' | 'Password' | 'Totp' | 'RecoveryKey';
		factor: 'first' | 'second' | 'either';
		requiresSecondFactor: boolean;
	}[];
	challenge: string;
	challengeIdentifier: string;
	externalAuthenticationUrl: string;
	allowCredentials: {
		webauthn: {
			type: 'public-key';
			id: string;
			transports?: string;
		}[];
		key: {
			type: 'public-key';
			id: string;
			transports?: string;
		}[];
	};
};
export type SignedChallenge = {
	clientData: string;
	credId: string;
	signature: string;
};
export type SignChallenge = (
	supportedCredentials: UserActionSignatureChallenge,
) => Promise<SignedChallenge>;
