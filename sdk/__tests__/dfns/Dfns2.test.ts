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

import { DfnsWallet, DfnsWalletOptions } from './dfnsWallet';
import { DfnsApiClient } from '@dfns/sdk';
import type { DfnsApiClientOptions } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Client } from '@hashgraph/sdk';
import {
	CLIENT_ACCOUNT_ID_ECDSA,
	CLIENT_PRIVATE_KEY_ECDSA,
} from '../config.js';
import { ethers } from 'ethers';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';

const client = Client.forTestnet();
client.setOperator(CLIENT_ACCOUNT_ID_ECDSA, CLIENT_PRIVATE_KEY_ECDSA.key);

describe('🧪 DFNS test', () => {
	it('Create a transaction, sign it with DFNS and send it to Hedera', async () => {
		const signer = new AsymmetricKeySigner({
			privateKey:
				'-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKrGoR4v2XoJzaTlNDhQ0hbd4gOvlGFiEEroqCj8CuCCoAoGCCqGSM49AwEHoUQDQgAEsSDhu7Jwx3hJEH9jyAQcKd0XNIW9Sq7CG8DQA7nQrPUfpIsubyWbMv7MRe5M92uRtgCvbPttPmph0uvPh2sAyg==\n-----END EC PRIVATE KEY-----', // private key for creating the ECDSA service account
			credId: 'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ', // credential of the ECDSA service account
			appOrigin: 'http://stablecoin.es',
		});

		const dfnsApiClientOptions: DfnsApiClientOptions = {
			appId: 'ap-b6uj2-95t58-55o0cprm1lqqkpn',
			authToken:
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg',
			baseUrl: 'https://api.dfns.ninja',
			signer: signer,
		};

		const dfnsApiClient: DfnsApiClient = new DfnsApiClient(
			dfnsApiClientOptions,
		);

		const dfnsWalletOptions: DfnsWalletOptions = {
			walletId: 'wa-5nclj-99leh-87epm4jjg9vmckie',
			dfnsClient: dfnsApiClient,
			maxRetries: 10,
			retryInterval: 2000,
		};

		const dfnsWallet: DfnsWallet = new DfnsWallet(dfnsWalletOptions);

		// getting evm ECDSA wallet's address
		// corresponds to the 0.0.4480852 Hedera account's address
		// this account was auto-created by transferring HBARs to the public key as an alias
		const address = await dfnsWallet.getAddress();
		console.log('address: ' + address);

		// creates a JSON-RPC provider
		const url = 'http://127.0.0.1:7546';
		const provider = await new ethers.providers.JsonRpcProvider(url);
		console.log('customHttpProvider: ' + JSON.stringify(provider));

		const contract = new ethers.Contract(
			'0xe54c85eec76df4c9daae7a9303e26ae508655c6f',
			HederaTokenManager__factory.abi,
		);

		// Specify the function and its parameters
		const functionName = 'wipe';
		const functionParams = [
			'0x0000000000000000000000000000000000004719',
			ethers.utils.parseEther('1'),
		];

		// Encode the function call
		const data = contract.interface.encodeFunctionData(
			functionName,
			functionParams,
		);

		const transaction: TransactionRequest = {
			to: '0xe54c85eec76df4c9daae7a9303e26ae508655c6f',
			nonce: 4,
			gasLimit: 15000000,
			gasPrice: 1820000000000,
			data: data,
			chainId: 0x128,
		};
		console.log('unsigned transaction: ' + JSON.stringify(transaction));

		const signedTransaction = await dfnsWallet.signTransaction(transaction);
		console.log('signed transaction: ' + signedTransaction);

		const transactionResponse = await provider.sendTransaction(
			signedTransaction,
		);
		console.log('Transaction Hash:', transactionResponse.hash);
	}, 30000);
});
