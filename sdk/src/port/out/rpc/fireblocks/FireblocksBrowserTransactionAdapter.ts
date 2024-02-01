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

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { InitializationData } from '../../TransactionAdapter.js';
import { ethers, Signer } from 'ethers';
import { singleton } from 'tsyringe';
import Injectable from '../../../../core/Injectable.js';
import type { Provider } from '@ethersproject/providers';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import Account from '../../../../domain/context/account/Account.js';
import { WalletConnectError } from '../../../../domain/context/network/error/WalletConnectError.js';
import {
	ConnectionState,
	WalletEvents,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet.js';
import LogService from '../../../../app/service/LogService.js';
import { WalletConnectRejectedError } from '../../../../domain/context/network/error/WalletConnectRejectedError.js';
import {
	HederaNetworks,
	unrecognized,
} from '../../../../domain/context/network/Environment.js';
import { SetNetworkCommand } from '../../../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../../../../app/usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import {
	EnvironmentMirrorNode,
	MirrorNode,
	MirrorNodes,
} from '../../../../domain/context/network/MirrorNode.js';
import {
	EnvironmentJsonRpcRelay,
	JsonRpcRelay,
	JsonRpcRelays,
} from '../../../../domain/context/network/JsonRpcRelay.js';
import {
	EnvironmentFactory,
	Factories,
} from '../../../../domain/context/factory/Factories.js';
import RPCTransactionAdapter from '../RPCTransactionAdapter.js';
import {
	FireblocksWeb3Provider,
	ChainId,
	ApiBaseUrl,
} from '@fireblocks/fireblocks-web3-provider';
import { HederaId } from '../../../in/StableCoin.js';

// eslint-disable-next-line no-var
declare var ethereum: FireblocksWeb3Provider;

const PRIVATE_KEY =
	'-----BEGIN PRIVATE KEY-----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-----END PRIVATE KEY-----';
const API_KEY = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const VAULT_ACCOUNT_IDS = '2';
const RPC_URL = 'https://testnet.hashio.io/api/';
const CHAIN_ID = 296;
const FIREBLOCKS_ACCOUNT_HEDERA_ID = '0.0.5712904';

@singleton()
export default class FireblocksBrowserTransactionAdapter extends RPCTransactionAdapter {
	account: Account;
	signerOrProvider: Signer | Provider;
	mirrorNodes: MirrorNodes;
	jsonRpcRelays: JsonRpcRelays;
	factories: Factories;

	async init(debug = false): Promise<string> {
		if (!debug) {
			ethereum = new FireblocksWeb3Provider({
				// apiBaseUrl: ApiBaseUrl.Sandbox // If using a sandbox workspace
				privateKey: PRIVATE_KEY,
				apiKey: API_KEY,
				vaultAccountIds: VAULT_ACCOUNT_IDS,
				rpcUrl: RPC_URL,
			});

			await this.connectFireblocks(false);
		}

		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.FIREBLOCKS_BROWSER,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logTrace('Fireblocks browser Initialized ', eventData);

		return this.networkService.environment;
	}

	async register(
		account?: Account,
		debug = false,
	): Promise<InitializationData> {
		if (account) {
			const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
				account.id,
			);
			this.account = account;
			this.account.publicKey = accountMirror.publicKey;
		}
		Injectable.registerTransactionHandler(this);
		!debug && (await this.connectFireblocks());
		LogService.logTrace('Fireblocks Browser registered as handler');
		return Promise.resolve({ account });
	}

	stop(): Promise<boolean> {
		this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
			status: ConnectionState.Disconnected,
			wallet: SupportedWallets.FIREBLOCKS_BROWSER,
		});
		LogService.logTrace('Fireblocks browser stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.FIREBLOCKS_BROWSER,
		});
		return Promise.resolve(true);
	}

	async connectFireblocks(pair = true): Promise<void> {
		try {
			this.eventService.emit(WalletEvents.walletFound, {
				wallet: SupportedWallets.FIREBLOCKS_BROWSER,
				name: SupportedWallets.FIREBLOCKS_BROWSER,
			});

			pair && (await this.pairWallet());
			this.signerOrProvider = new ethers.providers.Web3Provider(
				ethereum,
			).getSigner();
		} catch (error: any) {
			if ('code' in error && error.code === 4001) {
				throw new WalletConnectRejectedError(
					SupportedWallets.FIREBLOCKS_BROWSER,
				);
			}
			if (error instanceof WalletConnectError) {
				throw error;
			}
			throw new RuntimeError((error as Error).message);
		}
	}

	private async setFireblocksAccount(hederaId: string): Promise<void> {
		let mirrorAccount = undefined;
		try {
			const accountHederaId = new HederaId(hederaId);
			mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(
				accountHederaId,
			);
		} catch (e) {
			LogService.logError(
				'account could not be retrieved from mirror error : ' + e,
			);
		}
		if (mirrorAccount) {
			this.account = new Account({
				id: mirrorAccount.id!,
				evmAddress: mirrorAccount.accountEvmAddress,
				publicKey: mirrorAccount.publicKey,
			});
			this.signerOrProvider = new ethers.providers.Web3Provider(
				ethereum,
			).getSigner();
		} else {
			this.account = Account.NULL;
		}
		LogService.logTrace(
			'Paired Fireblocks Browser Wallet Event:',
			this.account,
		);
	}

	private async setFireblocksNetwork(chainId: any): Promise<void> {
		let network = unrecognized;
		let factoryId = '';
		let mirrorNode: MirrorNode = {
			baseUrl: '',
			apiKey: '',
			headerName: '',
		};
		let rpcNode: JsonRpcRelay = {
			baseUrl: '',
			apiKey: '',
			headerName: '',
		};

		const fireblocksNetwork = HederaNetworks.find(
			(i: any) => '0x' + i.chainId.toString(16) === chainId.toString(),
		);

		if (fireblocksNetwork) {
			network = fireblocksNetwork.network;

			if (this.factories) {
				try {
					const result = this.factories.factories.find(
						(i: EnvironmentFactory) =>
							i.environment === fireblocksNetwork.network,
					);
					if (result) {
						factoryId = result.factory.toString();
					}
				} catch (e) {
					console.error(
						`Factories could not be found for environment ${fireblocksNetwork.network} in  the initially provided list`,
					);
				}
			}
			if (this.mirrorNodes) {
				try {
					const result = this.mirrorNodes.nodes.find(
						(i: EnvironmentMirrorNode) =>
							i.environment === fireblocksNetwork.network,
					);
					if (result) {
						mirrorNode = result.mirrorNode;
					}
				} catch (e) {
					console.error(
						`Mirror Nodes could not be found for environment ${fireblocksNetwork.network} in  the initially provided list`,
					);
				}
			}
			if ((this, this.jsonRpcRelays)) {
				try {
					const result = this.jsonRpcRelays.nodes.find(
						(i: EnvironmentJsonRpcRelay) =>
							i.environment === fireblocksNetwork.network,
					);
					if (result) {
						rpcNode = result.jsonRpcRelay;
					}
				} catch (e) {
					console.error(
						`RPC Nodes could not be found for environment ${fireblocksNetwork.network} in  the initially provided list`,
					);
				}
			}
			LogService.logTrace('Fireblocks Network:', chainId);
		} else {
			console.error(chainId + ' not an hedera network');
		}

		await this.commandBus.execute(
			new SetNetworkCommand(network, mirrorNode, rpcNode),
		);
		await this.commandBus.execute(new SetConfigurationCommand(factoryId));

		this.signerOrProvider = new ethers.providers.Web3Provider(
			ethereum,
		).getSigner();

		// await new Promise(f => setTimeout(f, 3000));
	}

	private async pairWallet(): Promise<void> {
		await this.setFireblocksNetwork(CHAIN_ID);
		await this.setFireblocksAccount(FIREBLOCKS_ACCOUNT_HEDERA_ID);
		this.eventService.emit(WalletEvents.walletPaired, {
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.networkService.environment,
				recognized: this.networkService.environment != unrecognized,
				factoryId: this.networkService.configuration
					? this.networkService.configuration.factoryAddress
					: '',
			},
			wallet: SupportedWallets.FIREBLOCKS_BROWSER,
		});
	}

	protected registerWalletEvents(): void {
		LogService.logTrace('Fireblocks Browser does not have events');
	}
}
