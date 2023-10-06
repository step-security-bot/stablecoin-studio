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

import {
	Hbar,
	Client,
	PublicKey,
	TokenCreateTransaction,
	TransactionReceipt,
	TokenId,
} from '@hashgraph/sdk';

const ECDSA_ACCOUNT_ID = '0.0.4480852';
const ECDSA_ACCOUNT_PUBLIC_KEY =
	'03b78a80a5fa270ec7f7c7a9e59684c2da303845af66f68d9162d84ce0bca40bb2';

describe('🧪 DFNS test', () => {
	it('Create a transaction, sign it with DFNS and send it to Hedera', async () => {
		const transaction: TokenCreateTransaction = new TokenCreateTransaction()
			.setTokenName('Mamorales Token')
			.setTokenSymbol('MT')
			.setTreasuryAccountId(ECDSA_ACCOUNT_ID)
			.setInitialSupply(5000)
			.setAdminKey(PublicKey.fromStringECDSA(ECDSA_ACCOUNT_PUBLIC_KEY))
			.setMaxTransactionFee(new Hbar(30)); //Change the default max transaction fee

		console.log('transaction: ' + JSON.stringify(transaction));

		// Sign the transaction with DFNS
		const signedTransaction: TokenCreateTransaction = transaction;

		// Submit the transaction to a Hedera network
		//const txResponse = await signedTransaction.execute(client);

		//Get the transaction ID
		//const txId = txResponse.transactionId.toString();

		//Print the transaction ID to the console
		//console.log('The transaction ID ' + txId);

		//Request the receipt of the transaction
		//const receipt: TransactionReceipt = await txResponse.getReceipt(client);

		//Get the token ID from the receipt
		//const tokenId: TokenId = await receipt.tokenId!;

		//console.log('The new token ID is ' + tokenId);
	});
});
