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

/* eslint-disable jest/no-standalone-expect */

import { DfnsWallet, DfnsWalletOptions } from './dfnsWallet';
import { DfnsApiClient } from '@dfns/sdk';
import type { DfnsApiClientOptions } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { hashMessage, _TypedDataEncoder } from '@ethersproject/hash';
import { Client, TokenId, TokenAssociateTransaction } from '@hashgraph/sdk';
import {
	SignatureKind,
	SignatureStatus,
} from '@dfns/sdk/codegen/datamodel/Wallets';
import { joinSignature } from '@ethersproject/bytes';
import { concat, hexlify } from '@hashgraph/hethers/lib/utils';

const dfnsWalletId = 'wa-5phef-ico8c-9smr47d6ton6r8c2'; // Wallet ECDSA
const dfnsTestUrl = 'https://api.dfns.ninja';
const dfnsAppId = 'ap-b6uj2-95t58-55o0cprm1lqqkpn';
const dfnsAppOrigin = 'http://stablecoin.es';
const dfnsEcdsaServiceAccountAuthToken =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg';
const dfnsEcdsaServiceaccountCredentialId =
	'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ';
const privateKeyToCreateECDSAServiceAccount =
	'-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKrGoR4v2XoJzaTlNDhQ0hbd4gOvlGFiEEroqCj8CuCCoAoGCCqGSM49AwEHoUQDQgAEsSDhu7Jwx3hJEH9jyAQcKd0XNIW9Sq7CG8DQA7nQrPUfpIsubyWbMv7MRe5M92uRtgCvbPttPmph0uvPh2sAyg==\n-----END EC PRIVATE KEY-----';

const signer = new AsymmetricKeySigner({
	privateKey: privateKeyToCreateECDSAServiceAccount,
	credId: dfnsEcdsaServiceaccountCredentialId,
	appOrigin: dfnsAppOrigin,
});

const dfnsApiClientOptions: DfnsApiClientOptions = {
	appId: dfnsAppId,
	authToken: dfnsEcdsaServiceAccountAuthToken,
	baseUrl: dfnsTestUrl,
	signer: signer,
};

const dfnsApiClient: DfnsApiClient = new DfnsApiClient(dfnsApiClientOptions);

const dfnsWalletOptions: DfnsWalletOptions = {
	walletId: dfnsWalletId,
	dfnsClient: dfnsApiClient,
	maxRetries: 6,
	retryInterval: 2000,
};

const dfnsWallet: DfnsWallet = new DfnsWallet(dfnsWalletOptions);

const tokenHederaId = '0.0.5698159';
const tokenId = TokenId.fromString(tokenHederaId);

const dfnsAccountId = '0.0.4480852';
const dfnsPublicKey =
	'03b78a80a5fa270ec7f7c7a9e59684c2da303845af66f68d9162d84ce0bca40bb2';

const client = Client.forTestnet();
client.setOperatorWith(dfnsAccountId, dfnsPublicKey, signingService);
client.setMaxNodesPerTransaction(1);

const transaction = new TokenAssociateTransaction()
	.setAccountId(dfnsAccountId)
	.setTokenIds([tokenId]);

const sleep = (interval = 0) =>
	new Promise((resolve) => setTimeout(resolve, interval));

describe('🧪 Dfns signing a Hedera transaction', () => {
	it('Signing a raw transaction', async () => {
		await transaction.execute(client);
	}, 90_000);
});

async function signingService(
	transactionBytes: Uint8Array,
): Promise<Uint8Array> {
	const serializedTransaction = Buffer.from(transactionBytes).toString('hex');
	const signature = await signMessage(serializedTransaction);
	console.log(
		'xxx signatureToUint8Array.substring(2): ' + signature.substring(2),
	);
	const signatureToUint8Array1 = hexStringToUint8Array(signature);
	console.log('xxx signatureToUint8Array1: ' + signatureToUint8Array1);
	const signatureToUint8Array = hexStringToUint8Array(signature.substring(2));
	console.log('xxx signatureToUint8Array: ' + signatureToUint8Array);
	return signatureToUint8Array;
}

async function signMessage(message: string | Uint8Array): Promise<string> {
	const { walletId, dfnsClient } = dfnsWalletOptions;
	const res = await dfnsClient.wallets.generateSignature({
		walletId,
		body: { kind: SignatureKind.Hash, hash: hashMessage(message) },
	});
	const signature = await waitForSignature(res.id);
	console.log('xxx signature after joining: ' + JSON.stringify(signature));
	return signature;
}

async function waitForSignature(signatureId: string): Promise<string> {
	const { walletId, dfnsClient } = dfnsWalletOptions;
	let maxRetries = dfnsWalletOptions.maxRetries ?? 3;
	const retryInterval = dfnsWalletOptions.retryInterval ?? 12000;

	while (maxRetries > 0) {
		await sleep(retryInterval);

		const res = await dfnsClient.wallets.getSignature({
			walletId,
			signatureId,
		});
		if (res.status === SignatureStatus.Signed) {
			if (!res.signature) break;
			console.log(
				'xxx signature before joining: ' +
					JSON.stringify(res.signature),
			);

			const joiningSignature = hexlify(
				concat([res.signature.r, res.signature.s, '0x1b']),
			);

			console.log('xxx joining: ' + joiningSignature);

			return joinSignature({
				r: res.signature.r,
				s: res.signature.s,
				recoveryParam: res.signature.recid,
			});
		} else if (res.status === SignatureStatus.Failed) {
			break;
		}

		maxRetries -= 1;
	}

	const waitedSeconds = Math.floor((maxRetries * retryInterval) / 1000);
	throw new Error(
		`Signature request ${signatureId} took more than ${waitedSeconds}s to complete, stopping polling. Please update options "maxRetries" or "retryIntervals" to wait longer.`,
	);
}

function hexStringToUint8Array(hexString: string): Uint8Array {
	const uint8Array = new Uint8Array(hexString.length / 2);

	for (let i = 0; i < hexString.length; i += 2) {
		const byte = parseInt(hexString.substr(i, 2), 16);
		uint8Array[i / 2] = byte;
	}
	return uint8Array;
}
