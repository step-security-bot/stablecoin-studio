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

import { DfnsApiClient } from '@dfns/sdk';
import { SignatureKind } from '@dfns/sdk/codegen/datamodel/Wallets/types';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';

import {
	Hbar,
	Client,
	PublicKey,
	TokenCreateTransaction,
} from '@hashgraph/sdk';

import {
	CLIENT_ACCOUNT_ID_ECDSA,
	CLIENT_PUBLIC_KEY_ECDSA,
	CLIENT_PRIVATE_KEY_ECDSA,
} from '../config.js';

const client = Client.forTestnet();
client.setOperator(CLIENT_ACCOUNT_ID_ECDSA, CLIENT_PRIVATE_KEY_ECDSA.key);

describe('🧪 DFNS test', () => {
	it('Create a transaction, sign it with DFNS and send it to Hedera', async () => {
		// Creates a Hedera TokenCreateTransaction
		const transaction = await await new TokenCreateTransaction()
			.setTokenName('Mamorales Token')
			.setTokenSymbol('MT')
			.setTreasuryAccountId(CLIENT_ACCOUNT_ID_ECDSA)
			.setInitialSupply(5000)
			.setAdminKey(PublicKey.fromStringECDSA(CLIENT_PUBLIC_KEY_ECDSA.key))
			.setMaxTransactionFee(new Hbar(30))
			.freezeWith(client);

		console.log('transaction: ' + JSON.stringify(transaction));

		// Serializes the transaction to hex with leading '0x'
		const hexSerializedTransaction =
			'0x' + Buffer.from(transaction.toBytes()).toString('hex');

		console.log('hexSerializedTransaction: ' + hexSerializedTransaction);

		// Defines objects to be used by the dnfs typescript SDK
		const walletId = 'wa-6qfr0-heg0c-985bmvv9hphbok47';
		const signer = new AsymmetricKeySigner({
			privateKey:
				'-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKrGoR4v2XoJzaTlNDhQ0hbd4gOvlGFiEEroqCj8CuCCoAoGCCqGSM49AwEHoUQDQgAEsSDhu7Jwx3hJEH9jyAQcKd0XNIW9Sq7CG8DQA7nQrPUfpIsubyWbMv7MRe5M92uRtgCvbPttPmph0uvPh2sAyg==\n-----END EC PRIVATE KEY-----', // private key for creating the ECDSA service account
			credId: 'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ', // credential of the ECDSA service account
			appOrigin: 'http://stablecoin.es',
		});

		const dfnsApi = new DfnsApiClient({
			appId: 'ap-b6uj2-95t58-55o0cprm1lqqkpn',
			authToken:
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg',
			// ECDSA service account auth token
			baseUrl: 'https://api.dfns.ninja',
			signer,
		});

		// Requests to generate a message signature of serialized Hedera transaction
		const signatureRequest = await dfnsApi.wallets.generateSignature({
			walletId: walletId, // ECDSA wallet id
			body: {
				kind: SignatureKind.Message,
				message: hexSerializedTransaction,
			},
		});

		console.log('signature request: ' + JSON.stringify(signatureRequest));

		await delay(10000);

		// Gets the previously requested signature by the signature id
		const signature = await dfnsApi.wallets.getSignature({
			walletId: walletId, // ECDSA wallet id
			signatureId: signatureRequest.id,
		});

		console.log('signature: ' + JSON.stringify(signature));
	}, 60000);
});

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
