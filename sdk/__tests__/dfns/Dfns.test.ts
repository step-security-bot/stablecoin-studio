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
	AccountId,
	Transaction,
	PrivateKey,
} from '@hashgraph/sdk';

import {
	CLIENT_ACCOUNT_ID_ECDSA,
	CLIENT_ACCOUNT_ID_ED25519,
	CLIENT_PRIVATE_KEY_ECDSA,
	CLIENT_PRIVATE_KEY_ED25519,
	CLIENT_PUBLIC_KEY_ECDSA,
} from '../config.js';
// import List from '@hashgraph/sdk/lib/transaction/List.js';

const ECDSA_ACCOUNT_ID = '0.0.4480852';
const ECDSA_ACCOUNT_PUBLIC_KEY =
	'03b78a80a5fa270ec7f7c7a9e59684c2da303845af66f68d9162d84ce0bca40bb2';
const client = Client.forTestnet();
client.setOperator(
	'0.0.18208',
	'3030020100300706052b8104000a042204201474960fc868d557b688b25d9359f2c1ceb645964a3b98c7b69fab9ab26abd0d',
);

describe('🧪 DFNS test', () => {
	it('Create a transaction, sign it with DFNS and send it to Hedera', async () => {
		console.log('xxx ' + CLIENT_PUBLIC_KEY_ECDSA.key);
		const transaction = await (
			await new TokenCreateTransaction()
				.setTokenName('Mamorales Token')
				.setTokenSymbol('MT')
				.setTreasuryAccountId('0.0.18208')
				.setInitialSupply(5000)
				//.setAdminKey(PublicKey.fromStringECDSA(CLIENT_PUBLIC_KEY_ECDSA.key))
				.setMaxTransactionFee(new Hbar(30))
				.freezeWith(client)
		).sign(
			PrivateKey.fromString(
				'302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318',
			),
		); //Change the default max transaction fee

		console.log('transaction: ' + JSON.stringify(transaction));

		//-----------------------------------------------------------------------------------------------
		// const signedTransaction = await transaction.sign(PrivateKey.fromString("302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318"));

		const signaturesMap = transaction.getSignatures();
		const signaturesMapKeys = signaturesMap.keys();

		for (const signaturesMapKey of signaturesMapKeys) {
			const nodeSignatures = signaturesMap.get(signaturesMapKey);
			const keys = nodeSignatures!.keys();

			for (const key of keys) {
				console.log('public key: ' + key.toStringRaw());
			}
		}

		// console.log("signed transaction: " + JSON.stringify(signedTransaction));

		const txResponse = await transaction.execute(client);

		//Get the transaction ID
		const transactionId = txResponse.transactionId;

		console.log('transaction id: ' + transactionId);
		//-----------------------------------------------------------------------------------------------

		// Save the start time to be used later with request timeout
		/*const startTime = Date.now();

		// If node account IDs is locked then use the node account IDs
		// from the list, otherwise build a new list of one node account ID
		// using the entire network
		const node = {
            "0.testnet.hedera.com:50211": "0.0.3",
        };
		const nodeAccountId = AccountId.fromString(node['0.testnet.hedera.com:50211']);
		const nodeAccountIds = new List();
		nodeAccountIds.setList([nodeAccountId]);
		//const channel = node.getChannel();*/

		//-----------------------------------------------------------------------------------------------
		// const signedTransaction = await transaction.signWithOperator(client);
		//-----------------------------------------------------------------------------------------------

		const hexSerializedTransaction = Buffer.from(
			transaction.toBytes(),
		).toString('hex');
		const base64SerializedTransaction = Buffer.from(
			transaction.toBytes(),
		).toString('base64');

		console.log('hexSerializedTransaction: ' + hexSerializedTransaction);
		console.log('base64SerializedTransaction: ' + hexSerializedTransaction);

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

		/*const signatureRequest = await dfnsApi.wallets.generateSignature({
			walletId: walletId, // ECDSA wallet id
			body: {
				kind: SignatureKind.Hash,
				hash: "b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79",
			},
		});*/

		const signatureRequest = await dfnsApi.wallets.generateSignature({
			walletId: walletId, // ECDSA wallet id
			body: {
				kind: SignatureKind.Message,
				message: '0x' + hexSerializedTransaction,
			},
		});

		console.log('signature request: ' + JSON.stringify(signatureRequest));
		const { id } = signatureRequest;

		await delay(10000);

		const signature = await dfnsApi.wallets.getSignature({
			walletId: walletId, // ECDSA wallet id
			signatureId: id,
		});

		console.log('signature: ' + JSON.stringify(signature));

		/*const serializedSignedTransaction = Buffer.from(hexSerializedTransaction, "hex");
		const signedTransaction = Transaction.fromBytes(serializedSignedTransaction);

		const signaturesMap = signedTransaction.getSignatures();
		const signaturesMapKeys = JSON.stringify(signaturesMap.keys);

		console.log(signaturesMapKeys);
		for (const signaturesMapKey of signaturesMapKeys) {
			console.log(signaturesMapKey);
		}*/
	}, 60000);
});

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
