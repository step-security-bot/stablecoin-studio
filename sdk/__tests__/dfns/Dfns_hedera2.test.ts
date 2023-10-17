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
import { SignatureKind } from '@dfns/sdk/codegen/datamodel/Wallets';
import {
	AccountId,
	Client,
	TokenWipeTransaction,
	Transaction,
} from '@hashgraph/sdk';
import {
	CLIENT_ACCOUNT_ID_ECDSA,
	CLIENT_ACCOUNT_ID_ED25519,
	CLIENT_PRIVATE_KEY_ECDSA,
	CLIENT_PRIVATE_KEY_ED25519,
} from '../config.js';
import { ethers } from 'ethers';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';
import BigDecimal from '../../src/domain/context/shared/BigDecimal';
import Web3 from 'web3';
import { keccak256 } from '@ethersproject/keccak256';
import {
	SignatureLike,
	hexlify,
	arrayify,
	stripZeros,
	isBytesLike,
	splitSignature,
} from '@ethersproject/bytes';
import { defineReadOnly, resolveProperties } from '@ethersproject/properties';
import { RLP, checkProperties } from 'ethers/lib/utils';

const stableCoinProxyEvmAddress = '0xcec42855b3151c090866403f682af006354ed101';
const targetAccountEvmAddress = '0x0000000000000000000000000000000000004719';
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
client.setOperator(CLIENT_ACCOUNT_ID_ED25519, CLIENT_PRIVATE_KEY_ED25519.key);

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
		console.log('transaction: ' + JSON.stringify(transaction));

		const res = await dfnsApiClient.wallets.generateSignature({
			walletId: dfnsWalletId,
			body: {
				kind: SignatureKind.Hash,
				hash: keccak256(serialize(transaction)),
			},
		});
		const signature = await dfnsWallet.waitForSignature(res.id);
		console.log('signature: ' + signature);

		const serializedSignedTransaction = serialize(transaction, signature);
		console.log('signed transaction: ' + serializedSignedTransaction);

		const txtBuffer = Buffer.from(serializedSignedTransaction);
		const signedTransaction = Transaction.fromBytes(txtBuffer);

		await signedTransaction.execute(client);

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
});

function serialize(
	transaction: Transaction,
	signature?: SignatureLike,
): string {
	checkProperties(transaction, allowedTransactionKeys);

	const raw: Array<string | Uint8Array> = [];

	transactionFields.forEach(function (fieldInfo) {
		let value = (<any>transaction)[fieldInfo.name] || [];
		const options: DataOptions = {};
		if (fieldInfo.numeric) {
			options.hexPad = 'left';
		}
		value = arrayify(hexlify(value, options));

		// Fixed-width field
		if (
			fieldInfo.length &&
			value.length !== fieldInfo.length &&
			value.length > 0
		) {
			console.log(
				'invalid length for ' + fieldInfo.name,
				'transaction:' + fieldInfo.name,
				value,
			);
		}

		// Variable-width (with a maximum)
		if (fieldInfo.maxLength) {
			value = stripZeros(value);
			if (value.length > fieldInfo.maxLength) {
				console.log(
					'invalid length for ' + fieldInfo.name,
					'transaction:' + fieldInfo.name,
					value,
				);
			}
		}

		raw.push(hexlify(value));
	});

	let chainId = 0;
	if (transaction.chainId != null) {
		// A chainId was provided; if non-zero we'll use EIP-155
		chainId = transaction.chainId;

		if (typeof chainId !== 'number') {
			console.log(
				'invalid transaction.chainId',
				'transaction',
				transaction,
			);
		}
	} else if (signature && !isBytesLike(signature) && signature.v > 28) {
		// No chainId provided, but the signature is signing with EIP-155; derive chainId
		chainId = Math.floor((signature.v - 35) / 2);
	}

	// We have an EIP-155 transaction (chainId was specified and non-zero)
	if (chainId !== 0) {
		raw.push(hexlify(chainId)); // @TODO: hexValue?
		raw.push('0x');
		raw.push('0x');
	}

	// Requesting an unsigned transaction
	if (!signature) {
		return RLP.encode(raw);
	}

	// The splitSignature will ensure the transaction has a recoveryParam in the
	// case that the signTransaction function only adds a v.
	const sig = splitSignature(signature);

	// We pushed a chainId and null r, s on for hashing only; remove those
	let v = 27 + sig.recoveryParam;
	if (chainId !== 0) {
		raw.pop();
		raw.pop();
		raw.pop();
		v += chainId * 2 + 8;

		// If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
		if (sig.v > 28 && sig.v !== v) {
			console.log(
				'transaction.chainId/signature.v mismatch',
				'signature',
				signature,
			);
		}
	} else if (sig.v !== v) {
		console.log(
			'transaction.chainId/signature.v mismatch',
			'signature',
			signature,
		);
	}

	raw.push(hexlify(v));
	raw.push(stripZeros(arrayify(sig.r)));
	raw.push(stripZeros(arrayify(sig.s)));

	return RLP.encode(raw);
}
