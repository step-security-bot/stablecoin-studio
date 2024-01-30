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
import { ICommandHandler } from '../../../../../../core/command/CommandHandler';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated';
import AccountService from '../../../../../service/AccountService';
import StableCoinService from '../../../../../service/StableCoinService';
import TransactionService from '../../../../../service/TransactionService';
import { DecimalsOverRange } from '../../error/DecimalsOverRange';
import { OperationNotAllowed } from '../../error/OperationNotAllowed';
import { CashInCommand, CashInCommandResponse } from './CashInCommand';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery';
import {
	FreezeStatus,
	KycStatus,
} from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter';
import { AccountFreeze } from '../../error/AccountFreeze';
import { AccountNotKyc } from '../../error/AccountNotKyc';
import { GetReserveAmountQuery } from '../../../../query/stablecoin/getReserveAmount/GetReserveAmountQuery';
import { RESERVE_DECIMALS } from '../../../../../../domain/context/reserve/Reserve';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter';
import { BigNumber } from 'ethers';
import { TokenSupplyType } from '@hashgraph/sdk';

const MAX_SUPPLY = 9_223_372_036_854_775_807n;

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
	) {}

	async execute(command: CashInCommand): Promise<CashInCommandResponse> {
		const { amount, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
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
		if (tokenRelationship.freezeStatus === FreezeStatus.FROZEN) {
			throw new AccountFreeze(targetId.toString());
		}

		if (tokenRelationship.kycStatus === KycStatus.REVOKED) {
			throw new AccountNotKyc(targetId.toString());
		}

		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}

		const amountBd = BigDecimal.fromString(amount, coin.decimals);
		if (!coin.maxSupply || !coin.totalSupply)
			throw new OperationNotAllowed(`The stablecoin is not valid`);

		if (coin.supplyType === TokenSupplyType.Finite.toString()) {
			if (
				coin.maxSupply &&
				coin.maxSupply.isGreaterThan(BigDecimal.ZERO) &&
				amountBd.isGreaterThan(
					coin.maxSupply.subUnsafe(coin.totalSupply),
				)
			) {
				throw new OperationNotAllowed(
					`The total supply amount cannot be greater than the max supply (${coin.maxSupply}).`,
				);
			}
		} else {
			const max = BigDecimal.fromValue(
				BigNumber.from(MAX_SUPPLY),
				coin.decimals,
				coin.decimals,
			);

			if (amountBd.isGreaterThan(max.subUnsafe(coin.totalSupply))) {
				throw new OperationNotAllowed(
					`The total supply amount cannot be greater than the limit ${max}. You could check the limits here: https://docs.hedera.com/guides/docs/hedera-api/token-service/tokencreate`,
				);
			}
		}

		if (coin.evmProxyAddress) {
			const reserveAddress = await this.queryAdapter.getReserveAddress(
				coin.evmProxyAddress,
			);
			if (reserveAddress.toString() !== '0.0.0') {
				const totalAmount = amountBd.addUnsafe(coin.totalSupply);
				const commonDecimals =
					RESERVE_DECIMALS > coin.decimals
						? RESERVE_DECIMALS
						: coin.decimals;
				const reserveAmountBd = (
					await this.stableCoinService.queryBus.execute(
						new GetReserveAmountQuery(tokenId),
					)
				).payload;

				if (
					totalAmount
						.setDecimals(commonDecimals)
						.isGreaterThan(
							reserveAmountBd.setDecimals(commonDecimals),
						)
				) {
					throw new OperationNotAllowed(
						`The reserve is less than the amount to cash in (${amount})`,
					);
				}
			}
		}

		const res = await handler.cashin(capabilities, targetId, amountBd);
		return Promise.resolve(
			new CashInCommandResponse(res.error === undefined),
		);
	}
}
