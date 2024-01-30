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

import { CommandBus } from '../../../../../../core/command/CommandBus';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator';
import { QueryBus } from '../../../../../../core/query/QueryBus';
import { KycStatus } from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel';
import AccountService from '../../../../../service/AccountService';
import StableCoinService from '../../../../../service/StableCoinService';
import TransactionService from '../../../../../service/TransactionService';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery';
import { KycNotActive } from '../../error/KycNotActive';
import { OperationNotAllowed } from '../../error/OperationNotAllowed';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated';
import {
	RevokeKycCommand,
	RevokeKycCommandResponse,
} from './RevokeKycCommand';

@CommandHandler(RevokeKycCommand)
export class RevokeKycCommandHandler
	implements ICommandHandler<RevokeKycCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(CommandBus)
		public readonly commandBus: CommandBus,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: RevokeKycCommand,
	): Promise<RevokeKycCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		const tokenRelationship = (
			await this.stableCoinService.queryBus.execute(
				new GetAccountTokenRelationshipQuery(targetId, tokenId),
			)
		).payload;

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				targetId.toString(),
				tokenId.toString(),
			);
		}

		if (!coin.kycKey) {
			throw new KycNotActive(tokenId.value);
		}

		if (tokenRelationship.kycStatus !== KycStatus.GRANTED) {
			throw new OperationNotAllowed(
				`KYC cannot be revoked from account ${targetId} on token ${tokenId}`,
			);
		}

		const res = await handler.revokeKyc(capabilities, targetId);
		return Promise.resolve(
			new RevokeKycCommandResponse(res.error === undefined),
		);
	}
}
