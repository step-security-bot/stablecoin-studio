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

import CheckNums from '../../../../../../core/checks/numbers/CheckNums';
import { CommandBus } from '../../../../../../core/command/CommandBus';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator';
import BaseError from '../../../../../../core/error/BaseError';
import { QueryBus } from '../../../../../../core/query/QueryBus';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal';
import {
	FreezeStatus,
	KycStatus,
} from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel';
import AccountService from '../../../../../service/AccountService';
import StableCoinService from '../../../../../service/StableCoinService';
import TransactionService from '../../../../../service/TransactionService';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery';
import { AccountFreeze } from '../../error/AccountFreeze';
import { AccountNotKyc } from '../../error/AccountNotKyc';
import { DecimalsOverRange } from '../../error/DecimalsOverRange';
import { OperationNotAllowed } from '../../error/OperationNotAllowed';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated';
import {
	TransfersCommand,
	TransfersCommandResponse,
} from './TransfersCommand';

@CommandHandler(TransfersCommand)
export class TransfersCommandHandler
	implements ICommandHandler<TransfersCommand>
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
		command: TransfersCommand,
	): Promise<TransfersCommandResponse> {
		const { amounts, targetsIds, tokenId, targetId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();

		const errors: BaseError[] = [];

		for (let i = 0; i < targetsIds.length; i++) {
			const tokenRelationship = (
				await this.stableCoinService.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						targetsIds[i],
						tokenId,
					),
				)
			).payload;

			if (!tokenRelationship) {
				errors.push(
					new StableCoinNotAssociated(
						targetsIds[i].toString(),
						tokenId.toString(),
					),
				);
			} else if (tokenRelationship.freezeStatus === FreezeStatus.FROZEN) {
				errors.push(new AccountFreeze(targetsIds[i].toString()));
			} else if (tokenRelationship.kycStatus === KycStatus.REVOKED) {
				errors.push(new AccountNotKyc(targetsIds[i].toString()));
			}
		}

		if (errors.length > 0) throw errors;

		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		if (!coin.tokenId)
			throw new OperationNotAllowed(`The stablecoin is not valid`);

		const amountsBd: BigDecimal[] = [];

		for (let i = 0; i < amounts.length; i++) {
			if (CheckNums.hasMoreDecimals(amounts[i], coin.decimals)) {
				throw new DecimalsOverRange(coin.decimals);
			}
			amountsBd.push(BigDecimal.fromString(amounts[i], coin.decimals));
		}

		const res = await handler.transfers(
			capabilities,
			amountsBd,
			targetsIds,
			targetId,
		);
		return Promise.resolve(
			new TransfersCommandResponse(res.error === undefined),
		);
	}
}
