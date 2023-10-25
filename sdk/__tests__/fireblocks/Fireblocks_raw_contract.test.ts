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
import { createHash } from 'crypto';
import {
	FireblocksSDK,
	PeerType,
	TransactionOperation,
	TransactionStatus,
} from 'fireblocks-sdk';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';
import Web3 from 'web3';
import { BigDecimal } from '../../src/index.js';
import {
	Client,
	ContractExecuteTransaction,
	PublicKey,
	AccountId,
} from '@hashgraph/sdk';
import { WIPE_GAS } from '../../src/core/Constants.js';

describe('🧪 Firebocks signing a Hedera transaction', () => {
	const web3 = new Web3();

	const client = Client.forTestnet();
	client.setOperator(
		'0.0.18201',
		'302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318',
	);
	const vaultAccountId = '0.0.5712904';

	const apiSecretKey = fs.readFileSync(
		path.resolve('/home/mamorales/fireblocks_dario/fireblocks_secret.key'),
		'utf8',
	);
	const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
	const baseUrl = 'https://api.fireblocks.io';
	const fireblocks: FireblocksSDK = new FireblocksSDK(
		apiSecretKey,
		apiKey,
		baseUrl,
	);

	const targetAccountEvmAddress =
		'0x0000000000000000000000000000000000004719';
	const amountToWipe = new BigDecimal('0.1');
	const contractId = '0.0.4539400';

	const functionName = 'wipe';
	const parameters = [targetAccountEvmAddress, amountToWipe];

	const functionCallParameters = encodeFunctionCall(
		functionName,
		parameters,
		HederaTokenManager__factory.abi,
	);

	const nodeId = [];
	nodeId.push(new AccountId(3));

	const transaction = new ContractExecuteTransaction()
		.setNodeAccountIds(nodeId)
		.setContractId(contractId)
		.setFunctionParameters(functionCallParameters)
		.setGas(WIPE_GAS)
		.freezeWith(client);

	// eslint-disable-next-line jest/expect-expect
	it('Signing a raw transaction', async () => {
		const serializedTransaction = Buffer.from(
			transaction.toBytes(),
		).toString('hex');

		const signatureHex = await signArbitraryMessage(
			fireblocks,
			vaultAccountId,
			serializedTransaction,
		);

		const signatureBytes = Buffer.from(signatureHex, 'hex');

		const publicKey = PublicKey.fromString(
			'04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
		);
		const signedTransaction = transaction.addSignature(
			publicKey,
			signatureBytes,
		);

		await signedTransaction.execute(client);
	}, 90_000);

	function encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any,
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi) {
			const message = `Contract function ${functionName} not found in ABI, are you using the right version?`;
			throw new Error(message);
		}
		const encodedParametersHex = web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}
});

async function signArbitraryMessage(
	fireblocks: FireblocksSDK,
	vaultAccountId: string,
	message: string,
	bip44addressIndex = 0,
): Promise<string> {
	const wrappedMessage =
		'\x18Bitcoin Signed Message:\n' +
		String.fromCharCode(message.length) +
		message;

	const hash = createHash('sha256').update(wrappedMessage, 'utf8').digest();
	const content = createHash('sha256').update(hash).digest('hex');

	const { status, id } = await fireblocks.createTransaction({
		operation: TransactionOperation.RAW,
		assetId: 'HBAR_TEST',
		source: {
			type: PeerType.VAULT_ACCOUNT,
			id: vaultAccountId,
		},
		note: `BTC Message: ${message}`,
		extraParameters: {
			rawMessageData: {
				messages: [
					{
						content,
						bip44addressIndex,
					},
				],
			},
		},
	});

	let currentStatus = status;
	let txInfo: any;

	while (
		currentStatus != TransactionStatus.COMPLETED &&
		currentStatus != TransactionStatus.FAILED
	) {
		try {
			console.log(
				'keep polling for tx ' + id + '; status: ' + currentStatus,
			);
			txInfo = await fireblocks.getTransactionById(id);
			currentStatus = txInfo.status;
		} catch (err) {
			console.log('err', err);
		}
		await new Promise((r) => setTimeout(r, 1000));
	}

	const signature = txInfo.signedMessages[0].signature;
	console.log('signature: ' + signature.fullSig);

	return signature.fullSig;
}
