/*
 *
 * Hedera Stable Coin SDK
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

import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	addFractionalFeesCommand,
	addFractionalFeesCommandResponse,
} from './addFractionalFeesCommand.js';
import {
	CustomFee as HCustomFee,
	CustomFractionalFee as HCustomFractionalFee,
	FeeAssessmentMethod,
} from '@hashgraph/sdk';
import { fromCustomFeesToHCustomFees } from '../../../../../../domain/context/fee/CustomFee.js';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated.js';
import {
	FreezeStatus,
	KycStatus,
} from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel.js';
import { AccountFreeze } from '../../error/AccountFreeze.js';
import { AccountNotKyc } from '../../error/AccountNotKyc.js';

@CommandHandler(addFractionalFeesCommand)
export class addFractionalFeesCommandHandler
	implements ICommandHandler<addFractionalFeesCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: addFractionalFeesCommand,
	): Promise<addFractionalFeesCommandResponse> {
		const {
			tokenId,
			collectorId,
			amountNumerator,
			amountDenominator,
			min,
			max,
			net,
			collectorsExempt,
		} = command;

		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const stableCoin = await this.stableCoinService.get(tokenId);

		const tokenRelationship = (
			await this.stableCoinService.queryBus.execute(
				new GetAccountTokenRelationshipQuery(collectorId, tokenId),
			)
		).payload;

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				collectorId.toString(),
				tokenId.toString(),
			);
		}
		if (tokenRelationship.freezeStatus === FreezeStatus.FROZEN) {
			throw new AccountFreeze(collectorId.toString());
		}

		if (tokenRelationship.kycStatus === KycStatus.REVOKED) {
			throw new AccountNotKyc(collectorId.toString());
		}

		const HcustomFee: HCustomFee[] = fromCustomFeesToHCustomFees(
			stableCoin.customFees,
		);

		const customFeeToAdd = new HCustomFractionalFee()
			.setNumerator(amountNumerator)
			.setDenominator(amountDenominator)
			.setMin(min.toLong())
			.setMax(max.toLong())
			.setAssessmentMethod(new FeeAssessmentMethod(net))
			.setFeeCollectorAccountId(collectorId.toString())
			.setAllCollectorsAreExempt(collectorsExempt);

		HcustomFee.push(customFeeToAdd);

		const res = await handler.updateCustomFees(capabilities, HcustomFee);

		return Promise.resolve(
			new addFractionalFeesCommandResponse(res.error === undefined),
		);
	}
}
