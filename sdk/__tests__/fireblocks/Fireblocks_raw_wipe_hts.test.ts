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

import { BigDecimal } from '../../src/index.js';
import {
	Client,
	TokenWipeTransaction,
	PublicKey,
	AccountId,
	TokenId,
	PrivateKey,
} from '@hashgraph/sdk';

describe('🧪 Firebocks signing a Hedera transaction', () => {
	const operatorAccountHederaId = '0.0.19148';
	const operatorPrivateKey =
		'302e020100300506032b657004220420d1b6ec8c780c7a4bb4f1a8dc85e85ed0022a1b30e10ac5cfff2586a3c456d586';

	const signerPrivateKey =
		'302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318';
	const signerPublicKey =
		'b547baa785fe8c9a89c0a494d7ee65ac1bd0529020f985a4c31c3d09eb99142d';

	const client = Client.forTestnet();
	client.setOperator(operatorAccountHederaId, operatorPrivateKey);

	const tokenHederaId = '0.0.5760041';
	const tokenId = TokenId.fromString(tokenHederaId);
	const targetAccountHederaId = '0.0.18201';
	const targetAccountId = AccountId.fromString(targetAccountHederaId);
	const amountToWipe = new BigDecimal('0.1', 6);

	const nodeId = [];
	nodeId.push(new AccountId(3));

	const transaction = new TokenWipeTransaction()
		.setNodeAccountIds(nodeId)
		.setAccountId(targetAccountId)
		.setTokenId(tokenId)
		.setAmount(amountToWipe.toLong())
		.freezeWith(client);

	it('Signing a raw transaction', async () => {
		const publicKey = PublicKey.fromString(signerPublicKey);
		const privateKey = PrivateKey.fromString(signerPrivateKey);
		const signature = privateKey.signTransaction(transaction);
		const signedTransaction = transaction.addSignature(
			publicKey,
			signature,
		);

		await signedTransaction.execute(client);
	}, 90_000);
});
