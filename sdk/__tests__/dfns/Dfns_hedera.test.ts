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
import {
	AccountCreateTransaction,
	AccountId,
	Client,
	Hbar,
	KeyList,
	LocalProvider,
	PrivateKey,
	PublicKey,
	TokenCreateTransaction,
	TokenSupplyType,
	TokenType,
	TokenWipeTransaction,
	Wallet,
} from '@hashgraph/sdk';
import {
	CLIENT_ACCOUNT_ID_ECDSA,
	CLIENT_ACCOUNT_ID_ED25519,
	CLIENT_PRIVATE_KEY_ECDSA,
	CLIENT_PRIVATE_KEY_ED25519,
	CLIENT_PUBLIC_KEY_ECDSA,
	CLIENT_PUBLIC_KEY_ED25519,
} from '../config.js';
import { ethers } from 'ethers';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';
import BigDecimal from '../../src/domain/context/shared/BigDecimal';
import Web3 from 'web3';

const stableCoinProxyEvmAddress = '0xcec42855b3151c090866403f682af006354ed101';
const targetAccountEvmAddress = '0x0000000000000000000000000000000000004719';
const gasLimit = 15000000;
const gasPrice = 1820000000000;
const tokenDecimals = 6;
const wipeAmount = 1;
const jsonRpcRelayUrl = 'http://127.0.0.1:7546';
const dfnsWalletId = 'wa-5phef-ico8c-9smr47d6ton6r8c2'; // Wallet ECDSA 2
const dfnsTestUrl = 'https://api.dfns.ninja';
const dfnsAppId = 'ap-b6uj2-95t58-55o0cprm1lqqkpn';
const dfnsAppOrigin = 'http://stablecoin.es';
const dfnsEcdsaServiceAccountAuthToken =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg';
const dfnsEcdsaServiceaccountCredentialId =
	'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ';
const privateKeyToCreateECDSAServiceAccount =
	'-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKrGoR4v2XoJzaTlNDhQ0hbd4gOvlGFiEEroqCj8CuCCoAoGCCqGSM49AwEHoUQDQgAEsSDhu7Jwx3hJEH9jyAQcKd0XNIW9Sq7CG8DQA7nQrPUfpIsubyWbMv7MRe5M92uRtgCvbPttPmph0uvPh2sAyg==\n-----END EC PRIVATE KEY-----';

const targetAccountId = '0.0.18201';
const tokenId = '0.0.5700082';

const client = Client.forTestnet();
client.setOperator(CLIENT_ACCOUNT_ID_ECDSA, CLIENT_PRIVATE_KEY_ECDSA.key);

console.log(CLIENT_ACCOUNT_ID_ECDSA);
console.log(CLIENT_PRIVATE_KEY_ECDSA.key);

const web3 = new Web3();

describe('🧪 DFNS signing test with a Hedera native transaction', () => {
	it('Create a native Hedera transaction and sign it with DFNS', async () => {
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

		const dfnsApiClient: DfnsApiClient = new DfnsApiClient(
			dfnsApiClientOptions,
		);

		const dfnsWalletOptions: DfnsWalletOptions = {
			walletId: dfnsWalletId,
			dfnsClient: dfnsApiClient,
			maxRetries: 6,
			retryInterval: 2000,
		};

		const dfnsWallet: DfnsWallet = new DfnsWallet(dfnsWalletOptions);

		// creates a JSON-RPC provider
		const url = jsonRpcRelayUrl;
		const provider = await new ethers.providers.JsonRpcProvider(url);
		console.log('customHttpProvider: ' + JSON.stringify(provider));

		const contract = new ethers.Contract(
			stableCoinProxyEvmAddress,
			HederaTokenManager__factory.abi,
			provider,
		);

		// Get the account balance
		const beforeBalance = await contract.balanceOf(targetAccountEvmAddress);
		const bdBeforeBalance: BigDecimal = BigDecimal.fromStringFixed(
			beforeBalance.toString(),
			tokenDecimals,
		);
		console.log('balance before: ' + bdBeforeBalance._value);

		// Create the transaction
		const nodeId = [];
		nodeId.push(new AccountId(3));
		const transaction = new TokenWipeTransaction()
			.setAccountId(targetAccountId)
			.setNodeAccountIds(nodeId)
			.setTokenId(tokenId)
			.setAmount(wipeAmount)
			.freezeWith(client);

		// const key1 = PrivateKey.generateED25519();
		const privateKey = PrivateKey.fromString(
			'302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318',
		);
		const signature = privateKey.signTransaction(transaction);
		console.log('signature: ' + signature);
		const signedTransaction = transaction.addSignature(
			PublicKey.fromString(
				'302a300506032b6570032100b547baa785fe8c9a89c0a494d7ee65ac1bd0529020f985a4c31c3d09eb99142d',
			),
			signature,
		);

		// Sign the transaction
		// const signedTransaction = await transaction
		//    .sign(PrivateKey.fromString("302e020100300506032b657004220420f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318"));

		// Submit the transaction
		await signedTransaction.execute(client);

		//Print all public keys that signed the transaction
		console.log(
			'The public keys that signed the transaction  ' +
				signedTransaction.getSignatures(),
		);

		/////////////////////////////////////////////////////////////////////////////////////////////////////

		/*const randomKey = PrivateKey.generateED25519();
const treasuryKey = PrivateKey.generateED25519();
const key1 = PrivateKey.generateED25519();
const key2 = PrivateKey.generateED25519();

const nodeId = [];
nodeId.push(new AccountId(3));

// Create keylist
console.log(`- Generating keylist...`);
const keyList = new KeyList([key1.publicKey, key2.publicKey], 2); // 2-out-of-2
console.log("0");		 
const response = await new AccountCreateTransaction()
		  .setInitialBalance(new Hbar(3))
		  .setKey(PublicKey.fromString("b547baa785fe8c9a89c0a494d7ee65ac1bd0529020f985a4c31c3d09eb99142d"))
		  .execute(client);
console.log("1");		  
const receipt = await response.getReceipt(client);
console.log("2");
const treasuryId = receipt.accountId!;
console.log(`- Created treasury account ${treasuryId} that has a balance of 3ℏ`);

// Create NFT
console.log(`\n- Creating NFT (with all token keys set)`);
let nftCreate = await new TokenCreateTransaction()
  .setNodeAccountIds(nodeId)
  .setTokenName("Fall Collection")
  .setTokenSymbol("LEAF")
  .setTokenType(TokenType.NonFungibleUnique)
  .setDecimals(0)
  .setInitialSupply(0)
  .setTreasuryAccountId(treasuryId) // needs to sign
  .setSupplyType(TokenSupplyType.Finite)
  .setMaxSupply(5)
  // Set keys
  .setAdminKey(keyList) // multisig (keylist)
  .setFreezeKey(randomKey)
  .setKycKey(randomKey)
  .setWipeKey(randomKey)
  .setSupplyKey(randomKey)
  .setPauseKey(randomKey)
  .setFeeScheduleKey(randomKey)
  .freezeWith(client)
  .sign(treasuryKey);

// Adding multisig signatures
const sig1 = key1.signTransaction(nftCreate);
const sig2 = key2.signTransaction(nftCreate);
const nftCreateTxSign = nftCreate.addSignature(key1.publicKey, sig1).addSignature(key2.publicKey, sig2);

let nftCreateSubmit = await nftCreateTxSign.execute(client);
let nftCreateRx = await nftCreateSubmit.getReceipt(client);
let tokenId = nftCreateRx.tokenId;
console.log(`- Created NFT with Token ID: ${tokenId}`);*/

		/////////////////////////////////////////////////////////////////////////////////////////////////////

		const afterBalance = await contract.balanceOf(targetAccountEvmAddress);
		const bdAfterBalance: BigDecimal = BigDecimal.fromStringFixed(
			afterBalance.toString(),
			tokenDecimals,
		);
		console.log('balance after: ' + bdAfterBalance._value);

		expect(bdAfterBalance._value).toEqual(
			beforeBalance.subUnsafe(new BigDecimal(wipeAmount.toString()))
				._value,
		);
	}, 200000);

	async function accountCreatorFcn(
		pvKey: any,
		iBal: any,
	): Promise<AccountId> {
		const response = await new AccountCreateTransaction()
			.setInitialBalance(new Hbar(iBal))
			.setKey(pvKey.publicKey)
			.execute(client);
		const receipt = await response.getReceipt(client);
		return receipt.accountId!;
	}
});
