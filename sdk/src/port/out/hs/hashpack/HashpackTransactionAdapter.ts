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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Transaction,
	Signer,
	PublicKey as HPublicKey,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	TransferTransaction,
	TokenRevokeKycTransaction,
	TokenGrantKycTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenAssociateTransaction,
	TransactionResponse as HTransactionResponse,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import Injectable from '../../../../core/Injectable.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from './HashpackTransactionResponseAdapter.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { PairingError } from './error/PairingError.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import {
	ConnectionState,
	WalletEvents,
	WalletInitEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { SDK } from '../../../in/Common.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import Hex from '../../../../core/Hex.js';
import {
	HashConnect,
	HashConnectConnectionState,
	SessionData,
	DappMetadata,
} from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

const projectId = '8fc26370383a50de1c3bd638d334292e';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
	private hc: HashConnect;
	public account: Account;

	public signer: Signer | null;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus)
		private readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	async init(network?: string): Promise<string> {
		const currentNetwork = await this.connectHashConnect(false, network);
		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.HASHPACK,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);

		return currentNetwork;
	}

	private async setSigner(): Promise<void> {
		this.signer = this.hc.getSigner(this.account.id.toHederaAddress());
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Hashpack Registered as handler');
		this.connectHashConnect(true);

		return Promise.resolve({
			account: this.account,
		});
	}

	async connectHashConnect(pair = true, network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		try {
			const hashpackNetwork =
				currentNetwork == 'testnet'
					? LedgerId.TESTNET
					: LedgerId.MAINNET;

			this.hc = new HashConnect(hashpackNetwork, projectId, {
				// dApp metadata options are optional, but are highly recommended to use
				name: SDK.appMetadata.name,
				description: SDK.appMetadata.description,
				url: SDK.appMetadata.url,
				icons: [],
			});
		} catch (error: any) {
			LogService.logTrace('Error instantianting Hashpack', error);
			return currentNetwork;
		}

		LogService.logTrace('Client Initialized');
		this.eventService.emit(WalletEvents.walletFound, {
			wallet: SupportedWallets.HASHPACK,
			name: SupportedWallets.HASHPACK,
		});

		if (pair) {
			LogService.logTrace('Checking for previously saved pairings: ');

			this.setUpHashConnectEvents();

			await this.hc.init();

			await this.hc.openPairingModal();
		}

		return currentNetwork;
	}

	setUpHashConnectEvents() {
		this.hc.pairingEvent.on(async (newPairing) => {
			this.account = await this.getAccountInfo(newPairing.accountIds[0]);
			await this.setSigner();

			const iniData: InitializationData = {
				account: this.account,
			};
			this.eventService.emit(WalletEvents.walletPaired, {
				data: iniData,
				network: {
					name: this.networkService.environment,
					recognized: true,
					factoryId: this.networkService.configuration
						? this.networkService.configuration.factoryAddress
						: '',
				},
				wallet: SupportedWallets.HASHPACK,
			});
			LogService.logTrace('Previous paring found: ', this.account);
		});

		this.hc.disconnectionEvent.on((data) => {
			this.stop();
		});
	}

	async stop(): Promise<boolean> {
		if (this.hc) await this.hc.disconnect();

		LogService.logTrace('Hashpack stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.HASHPACK,
		});
		return Promise.resolve(true);
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		if (!this.signer) throw new SigningError('Signer is empty');
		try {
			LogService.logTrace(
				'Hashpack is singing and sending transaction:',
				nameFunction,
				t,
			);

			let signedT = t;
			if (!t.isFrozen()) {
				signedT = await t.freezeWithSigner(this.signer);
			}
			let hashPackTransactionResponse;
			if (
				t instanceof TokenCreateTransaction ||
				t instanceof TokenWipeTransaction ||
				t instanceof TokenBurnTransaction ||
				t instanceof TokenMintTransaction ||
				t instanceof TokenPauseTransaction ||
				t instanceof TokenUnpauseTransaction ||
				t instanceof TokenDeleteTransaction ||
				t instanceof TokenFreezeTransaction ||
				t instanceof TokenUnfreezeTransaction ||
				t instanceof TokenGrantKycTransaction ||
				t instanceof TokenRevokeKycTransaction ||
				t instanceof TransferTransaction ||
				t instanceof TokenFeeScheduleUpdateTransaction ||
				t instanceof TokenAssociateTransaction
			) {
				window.alert('hedera transaction');

				hashPackTransactionResponse = await t.executeWithSigner(
					this.signer,
				);

				window.alert('hedera transaction executed');
			} else {
				hashPackTransactionResponse = await t.executeWithSigner(
					this.signer,
				);

				console.log(
					'hashPackTransactionResponse : ' +
						hashPackTransactionResponse,
				);
			}
			return await HashpackTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				this.signer,
				hashPackTransactionResponse as HTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}

	public async restart(network: string): Promise<void> {
		await this.stop();
		await this.init(network);
	}

	getAccount(): Account {
		if (this.account) return this.account;
		throw new RuntimeError(
			'There are no accounts currently paired with HashPack!',
		);
	}

	async getAccountInfo(id: string): Promise<Account> {
		const account = (
			await this.queryBus.execute(
				new GetAccountInfoQuery(HederaId.from(id)),
			)
		).account;
		if (!account.id) throw new AccountIdNotValid(id.toString());
		return new Account({
			id: account.id,
			publicKey: account.publicKey,
			evmAddress: account.accountEvmAddress,
		});
	}

	async sign(message: string | Transaction): Promise<string> {
		if (!this.signer) throw new SigningError('Signer is empty');
		if (!(message instanceof Transaction))
			throw new SigningError(
				'Hashpack must sign a transaction not a string',
			);

		try {
			if (
				!this.networkService.consensusNodes ||
				this.networkService.consensusNodes.length == 0
			) {
				throw new Error(
					'In order to create sign multisignature transactions you must set consensus nodes for the environment',
				);
			}

			const PublicKey_Der_Encoded =
				this.account.publicKey?.toHederaKey().toStringDer() ?? '';

			const signedTrans = await this.signer.signTransaction(message);

			const list = signedTrans.getSignatures();
			const nodes_signature = list.get(
				this.networkService.consensusNodes[0].nodeId,
			);
			if (nodes_signature) {
				const pk_signature = nodes_signature.get(PublicKey_Der_Encoded);
				if (pk_signature) {
					return Hex.fromUint8Array(pk_signature);
				}
				throw new Error(
					'Hashpack no signatures found for public key : ' +
						PublicKey_Der_Encoded,
				);
			}
			throw new Error(
				'Hashpack no signatures found for node id : ' +
					this.networkService.consensusNodes[0].nodeId,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
}
