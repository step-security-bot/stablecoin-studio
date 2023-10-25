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

import fs from 'fs';
import path from 'path';
import { FireblocksWeb3Provider } from '@fireblocks/fireblocks-web3-provider';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';
import { ethers } from 'ethers';

const Web3 = require('web3');
const CONTRACT_ABI = HederaTokenManager__factory.abi;
const CONTRACT_ADDRESS = '0xe54c85eec76df4c9daae7a9303e26ae508655c6f';

const targetAccountEvmAddress = '0x0000000000000000000000000000000000004719';
const wipeAmount = '0.1';

describe('🧪 Signing a Hedera transaction using the Fireblocks web3 integration', () => {
	const apiSecretKey = fs.readFileSync(
		path.resolve('/home/mamorales/fireblocks_dario/fireblocks_secret.key'),
		'utf8',
	);
	const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
	const baseUrl = 'https://api.fireblocks.io';

	// eslint-disable-next-line jest/expect-expect
	it('Calling a smart contract deployed by the Stablecoin studio wipe functionality', async () => {
		const eip1193Provider = new FireblocksWeb3Provider({
			apiBaseUrl: baseUrl,
			privateKey: apiSecretKey,
			apiKey: apiKey,
			vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS,
			rpcUrl: 'http://127.0.0.1:7546/api',
			logTransactionStatusChanges: true,
		});
		console.log(
			'Fireblocks web3 provider: ' + JSON.stringify(eip1193Provider),
		);

		const web3 = new Web3(eip1193Provider);
		const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
		const myAddr = await web3.eth.getAccounts();

		await contract.methods
			.wipe(targetAccountEvmAddress, ethers.utils.parseEther(wipeAmount))
			.send({
				from: myAddr[0],
			});
		// Specify the function and its parameters
		/*const functionName = 'wipe';
		const functionParams = [
			targetAccountEvmAddress,
			ethers.utils.parseEther(wipeAmount),
		];

		// Encode the function call
		const data = contract.interface.encodeFunctionData(
			functionName,
			functionParams,
		);

		const transaction: TransactionRequest = {
			to: stableCoinProxyEvmAddress,
			nonce: 25,
			gasLimit: gasLimit,
			gasPrice: gasPrice,
			data: data,
			chainId: hederaTestnetChainId,
		};
		console.log('unsigned transaction: ' + JSON.stringify(transaction));*/
	});
});
