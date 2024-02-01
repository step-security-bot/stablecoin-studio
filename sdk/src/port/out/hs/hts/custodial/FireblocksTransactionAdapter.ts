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
	CustodialWalletService,
	FireblocksConfig,
	SignatureRequest,
} from '@hashgraph/hedera-custodians-integration';
import { singleton } from 'tsyringe';

import { Client, Transaction } from '@hashgraph/sdk';

import EventService from '../../../../../app/service/event/EventService';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../../app/service/event/WalletEvent';
import LogService from '../../../../../app/service/LogService';
import NetworkService from '../../../../../app/service/NetworkService';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../../core/Injectable';
import { Environment } from '../../../../../domain/context/network/Environment';
import TransactionResponse from '../../../../../domain/context/transaction/TransactionResponse.js';
import { MirrorNodeAdapter } from '../../../mirror/MirrorNodeAdapter';
import { InitializationData } from '../../../TransactionAdapter';
import { TransactionType } from '../../../TransactionResponseEnums';
import { SigningError } from '../../error/SigningError';
import { HederaTransactionAdapter } from '../../HederaTransactionAdapter';
import { TransactionResponse as HTransactionResponse } from '@hashgraph/sdk/lib/exports';
import Account, {
	AccountProps,
} from '../../../../../domain/context/account/Account';
import { HTSTransactionResponseAdapter } from '../HTSTransactionResponseAdapter';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import FireblocksSettings from '../../../../../domain/context/custodialwalletsettings/FireblocksSettings';
import { CustodialTransactionAdapter } from './CustodialTransactionAdapter';

@singleton()
export class FireblocksTransactionAdapter extends CustodialTransactionAdapter {
	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: this.getSupportedWallet(),
			initData: {},
		});
		LogService.logTrace('Fireblocks Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	initCustodialWalletService(settings: FireblocksSettings): void {
		const { apiKey, apiSecretKey, baseUrl, vaultAccountId, assetId } =
			settings;
		this.custodialWalletService = new CustodialWalletService(
			new FireblocksConfig(
				apiKey,
				apiSecretKey,
				baseUrl,
				vaultAccountId,
				assetId,
			),
		);
	}

	getSupportedWallet(): SupportedWallets {
		return SupportedWallets.FIREBLOCKS;
	}
}
