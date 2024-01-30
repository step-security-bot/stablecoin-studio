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

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable';
import BigDecimal from '../../domain/context/shared/BigDecimal';
import ContractId from '../../domain/context/contract/ContractId';
import { CommandBus } from '../../core/command/CommandBus';
import { handleValidation } from './Common';
import { UpdateReserveAmountCommand } from '../../app/usecase/command/reserve/operations/updateReserveAmount/UpdateReserveAmountCommand';
import { Balance } from '../../domain/context/stablecoin/Balance';
import { HederaId } from '../../domain/context/shared/HederaId';
import UpdateReserveAmountRequest from './request/UpdateReserveAmountRequest';
import GetReserveAmountRequest from './request/GetReserveAmountRequest';
import { RESERVE_DECIMALS } from '../../domain/context/reserve/Reserve';
import { GetReserveAmountQuery } from '../../app/usecase/query/stablecoin/getReserveAmount/GetReserveAmountQuery';
import { QueryBus } from '../../core/query/QueryBus';
import { LogError } from '../../core/decorator/LogErrorDecorator';
import { MirrorNodeAdapter } from '../../port/out/mirror/MirrorNodeAdapter';

interface IReserveDataFeedInPort {
	getReserveAmount(request: GetReserveAmountRequest): Promise<Balance>;
	updateReserveAmount(request: UpdateReserveAmountRequest): Promise<boolean>;
}

class ReserveDataFeedInPort implements IReserveDataFeedInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	@LogError
	async getReserveAmount(request: GetReserveAmountRequest): Promise<Balance> {
		handleValidation('GetReserveAmountRequest', request);

		const res = await this.queryBus.execute(
			new GetReserveAmountQuery(HederaId.from(request.tokenId)),
		);

		return new Balance(res.payload);
	}

	@LogError
	async updateReserveAmount(
		request: UpdateReserveAmountRequest,
	): Promise<boolean> {
		handleValidation('UpdateReserveAmountRequest', request);

		const reserveId: string = (
			await this.mirrorNode.getContractInfo(request.reserveAddress)
		).id;
		return (
			await this.commandBus.execute(
				new UpdateReserveAmountCommand(
					new ContractId(reserveId),
					BigDecimal.fromString(
						request.reserveAmount,
						RESERVE_DECIMALS,
					),
				),
			)
		).payload;
	}
}

const ReserveDataFeed = new ReserveDataFeedInPort();
export default ReserveDataFeed;
