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

import { InitializationData } from '../../TransactionAdapter';
import { ethers, Signer } from 'ethers';
import { singleton } from 'tsyringe';
import Injectable from '../../../../core/Injectable.js';
import type { Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import Account from '../../../../domain/context/account/Account.js';

import { MetaMaskInpageProvider } from '@metamask/providers';
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

// eslint-disable-next-line no-var
declare var ethereum: MetaMaskInpageProvider;

@singleton()
export default class MetamaskTransactionAdapter extends RPCTransactionAdapter {
	account: Account;
	signerOrProvider: Signer | Provider;
	mirrorNodes: MirrorNodes;
	jsonRpcRelays: JsonRpcRelays;
	factories: Factories;

	async init(debug = false): Promise<string> {
		!debug && (await this.connectMetamask(false));
		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.METAMASK,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logTrace('Metamask Initialized ', eventData);

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
		!debug && (await this.connectMetamask());
		LogService.logTrace('Metamask registered as handler');
		return Promise.resolve({ account });
	}

	stop(): Promise<boolean> {
		this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
			status: ConnectionState.Disconnected,
			wallet: SupportedWallets.METAMASK,
		});
		LogService.logTrace('Metamask stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.METAMASK,
		});
		return Promise.resolve(true);
	}

	async connectMetamask(pair = true): Promise<void> {
		try {
			const ethProvider = await detectEthereumProvider({ silent: true });
			if (ethProvider) {
				this.eventService.emit(WalletEvents.walletFound, {
					wallet: SupportedWallets.METAMASK,
					name: SupportedWallets.METAMASK,
				});
				if (ethProvider.isMetaMask) {
					if (pair && !ethereum.isConnected())
						throw new WalletConnectError(
							'Metamask is not connected!',
						);

					pair && (await this.pairWallet());
					this.signerOrProvider = new ethers.providers.Web3Provider(
						// @ts-expect-error No TS compatibility
						ethereum,
					).getSigner();
				} else {
					throw new WalletConnectError('Metamask was not found!');
				}
			}
		} catch (error: any) {
			if ('code' in error && error.code === 4001) {
				throw new WalletConnectRejectedError(SupportedWallets.METAMASK);
			}
			if (error instanceof WalletConnectError) {
				throw error;
			}
			throw new RuntimeError((error as Error).message);
		}
	}

	private async setMetasmaskAccount(evmAddress: string): Promise<void> {
		let mirrorAccount = undefined;
		try {
			mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(
				evmAddress,
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
				// @ts-expect-error No TS compatibility
				ethereum,
			).getSigner();
		} else {
			this.account = Account.NULL;
		}
		LogService.logTrace('Paired Metamask Wallet Event:', this.account);
	}

	private async setMetamaskNetwork(chainId: any): Promise<void> {
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

		const metamaskNetwork = HederaNetworks.find(
			(i: any) => '0x' + i.chainId.toString(16) === chainId.toString(),
		);

		if (metamaskNetwork) {
			network = metamaskNetwork.network;

			if (this.factories) {
				try {
					const result = this.factories.factories.find(
						(i: EnvironmentFactory) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						factoryId = result.factory.toString();
					}
				} catch (e) {
					console.error(
						`Factories could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			if (this.mirrorNodes) {
				try {
					const result = this.mirrorNodes.nodes.find(
						(i: EnvironmentMirrorNode) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						mirrorNode = result.mirrorNode;
					}
				} catch (e) {
					console.error(
						`Mirror Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			if ((this, this.jsonRpcRelays)) {
				try {
					const result = this.jsonRpcRelays.nodes.find(
						(i: EnvironmentJsonRpcRelay) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						rpcNode = result.jsonRpcRelay;
					}
				} catch (e) {
					console.error(
						`RPC Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			LogService.logTrace('Metamask Network:', chainId);
		} else {
			console.error(chainId + ' not an hedera network');
		}

		await this.commandBus.execute(
			new SetNetworkCommand(network, mirrorNode, rpcNode),
		);
		await this.commandBus.execute(new SetConfigurationCommand(factoryId));

		this.signerOrProvider = new ethers.providers.Web3Provider(
			// @ts-expect-error No TS compatibility
			ethereum,
		).getSigner();

		// await new Promise(f => setTimeout(f, 3000));
	}

	private async pairWallet(): Promise<void> {
		const accts = await ethereum.request({
			method: 'eth_requestAccounts',
		});
		if (accts && 'length' in accts) {
			const evmAddress = (accts as string[])[0];

			const chainId = await ethereum.request({ method: 'eth_chainId' });
			await this.setMetamaskNetwork(chainId);
			await this.setMetasmaskAccount(evmAddress);
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
				wallet: SupportedWallets.METAMASK,
			});
		} else {
			LogService.logTrace('Paired Metamask failed with no accounts');
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.METAMASK,
			});
		}
	}

	protected registerWalletEvents(): void {
		try {
			if (typeof window === 'undefined' || !(window as any)?.ethereum)
				return;
			ethereum.on('accountsChanged', async (acct) => {
				const accounts = acct as string[];
				if (
					accounts.length > 0 &&
					this.account &&
					accounts[0] !== this.account.evmAddress
				) {
					await this.setMetasmaskAccount(accounts[0]);
					this.eventService.emit(WalletEvents.walletPaired, {
						data: {
							account: this.account,
							pairing: '',
							topic: '',
						},
						network: {
							name: this.networkService.environment,
							recognized:
								this.networkService.environment != unrecognized,
							factoryId:
								this.networkService.configuration
									.factoryAddress,
						},
						wallet: SupportedWallets.METAMASK,
					});
				} else {
					LogService.logTrace(
						'Metamask disconnected from the wallet',
					);
					this.eventService.emit(WalletEvents.walletDisconnect, {
						wallet: SupportedWallets.METAMASK,
					});
				}
			});
			ethereum.on('chainChanged', async (chainId) => {
				await this.setMetamaskNetwork(chainId);
				let evmAddress = this.account.evmAddress;
				if (!evmAddress) {
					const accts = await ethereum.request({
						method: 'eth_requestAccounts',
					});
					evmAddress =
						accts && 'length' in accts
							? (accts as string[])[0]
							: '';
				}
				await this.setMetasmaskAccount(evmAddress);
				this.eventService.emit(WalletEvents.walletPaired, {
					data: {
						account: this.account,
					},
					network: {
						name: this.networkService.environment,
						recognized:
							this.networkService.environment != unrecognized,
						factoryId: this.networkService.configuration
							? this.networkService.configuration.factoryAddress
							: '',
					},
					wallet: SupportedWallets.METAMASK,
				});
			});
		} catch (error) {
			LogService.logError(error);
			throw new WalletConnectError('Ethereum is not defined');
		}
	}
}
