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
import CreateRequest from './request/CreateRequest';
import CashInRequest from './request/CashInRequest';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest';
import BurnRequest from './request/BurnRequest';
import RescueRequest from './request/RescueRequest';
import RescueHBARRequest from './request/RescueHBARRequest';
import WipeRequest from './request/WipeRequest';
import AssociateTokenRequest from './request/AssociateTokenRequest';
import BigDecimal from '../../domain/context/shared/BigDecimal';
import { HederaId } from '../../domain/context/shared/HederaId';
import ContractId from '../../domain/context/contract/ContractId';
import EvmAddress from '../../domain/context/contract/EvmAddress';
import {
	StableCoinProps,
	TRANSFER_LIST_SIZE,
} from '../../domain/context/stablecoin/StableCoin';
import { QueryBus } from '../../core/query/QueryBus';
import { CommandBus } from '../../core/command/CommandBus';
import { CashInCommand } from '../../app/usecase/command/stablecoin/operations/cashin/CashInCommand';
import StableCoinViewModel from '../out/mirror/response/StableCoinViewModel';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel';
import StableCoinService from '../../app/service/StableCoinService';
import { GetStableCoinQuery } from '../../app/usecase/query/stablecoin/get/GetStableCoinQuery';
import { CreateCommand } from '../../app/usecase/command/stablecoin/create/CreateCommand';
import PublicKey from '../../domain/context/account/PublicKey';
import DeleteRequest from './request/DeleteRequest';
import FreezeAccountRequest from './request/FreezeAccountRequest';
import PauseRequest from './request/PauseRequest';
import GetAccountBalanceRequest from './request/GetAccountBalanceRequest';
import GetAccountBalanceHBARRequest from './request/GetAccountBalanceHBARRequest';
import CapabilitiesRequest from './request/CapabilitiesRequest';
import IsAccountAssociatedTokenRequest from './request/IsAccountAssociatedTokenRequest';
import { Balance } from '../../domain/context/stablecoin/Balance';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities';
import {
	Capability,
	Access,
	Operation,
} from '../../domain/context/stablecoin/Capability';
import { TokenSupplyType } from '../../domain/context/stablecoin/TokenSupply';
import Account from '../../domain/context/account/Account';
import { BurnCommand } from '../../app/usecase/command/stablecoin/operations/burn/BurnCommand';
import { RescueCommand } from '../../app/usecase/command/stablecoin/operations/rescue/RescueCommand';
import { RescueHBARCommand } from '../../app/usecase/command/stablecoin/operations/rescueHBAR/RescueHBARCommand';
import { WipeCommand } from '../../app/usecase/command/stablecoin/operations/wipe/WipeCommand';
import { PauseCommand } from '../../app/usecase/command/stablecoin/operations/pause/PauseCommand';
import { UnPauseCommand } from '../../app/usecase/command/stablecoin/operations/unpause/UnPauseCommand';
import { DeleteCommand } from '../../app/usecase/command/stablecoin/operations/delete/DeleteCommand';
import { FreezeCommand } from '../../app/usecase/command/stablecoin/operations/freeze/FreezeCommand';
import { UnFreezeCommand } from '../../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommand';
import { GetAccountInfoQuery } from '../../app/usecase/query/account/info/GetAccountInfoQuery';
import { handleValidation } from './Common';
import UpdateReserveAddressRequest from './request/UpdateReserveAddressRequest';
import GetReserveAddressRequest from './request/GetReserveAddressRequest';
import { UpdateReserveAddressCommand } from '../../app/usecase/command/stablecoin/operations/updateReserveAddress/UpdateReserveAddressCommand';
import { RESERVE_DECIMALS } from '../../domain/context/reserve/Reserve';
import ReserveViewModel from '../out/mirror/response/ReserveViewModel';
import { BalanceOfQuery } from '../../app/usecase/query/stablecoin/balanceof/BalanceOfQuery';
import { BalanceOfHBARQuery } from '../../app/usecase/query/stablecoin/balanceOfHBAR/BalanceOfHBARQuery';
import { GetReserveAddressQuery } from '../../app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQuey';
import KYCRequest from './request/KYCRequest';
import { GrantKycCommand } from '../../app/usecase/command/stablecoin/operations/grantKyc/GrantKycCommand';
import { RevokeKycCommand } from '../../app/usecase/command/stablecoin/operations/revokeKyc/RevokeKycCommand';
import { LogError } from '../../core/decorator/LogErrorDecorator';
import { GetAccountTokenRelationshipQuery } from '../../app/usecase/query/account/tokenRelationship/GetAccountTokenRelationshipQuery';
import {
	FreezeStatus,
	KycStatus,
} from '../out/mirror/response/AccountTokenRelationViewModel';
import TransfersRequest from './request/TransfersRequest';
import UpdateRequest from './request/UpdateRequest';
import { TransfersCommand } from '../../app/usecase/command/stablecoin/operations/transfer/TransfersCommand';
import { UpdateCommand } from '../../app/usecase/command/stablecoin/update/UpdateCommand';
import NetworkService from '../../app/service/NetworkService';
import { AssociateCommand } from '../../app/usecase/command/account/associate/AssociateCommand';
import { MirrorNodeAdapter } from "../out/mirror/MirrorNodeAdapter";

export {
	StableCoinViewModel,
	StableCoinListViewModel,
	ReserveViewModel,
	TRANSFER_LIST_SIZE,
};
export { StableCoinCapabilities, Capability, Access, Operation, Balance };
export { TokenSupplyType };
export { BigDecimal, HederaId, ContractId, EvmAddress, PublicKey };

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<boolean>;
	burn(request: BurnRequest): Promise<boolean>;
	rescue(request: RescueRequest): Promise<boolean>;
	rescueHBAR(request: RescueHBARRequest): Promise<boolean>;
	wipe(request: WipeRequest): Promise<boolean>;
	associate(request: AssociateTokenRequest): Promise<boolean>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	getBalanceOfHBAR(request: GetAccountBalanceHBARRequest): Promise<Balance>;
	capabilities(request: CapabilitiesRequest): Promise<StableCoinCapabilities>;
	pause(request: PauseRequest): Promise<boolean>;
	unPause(request: PauseRequest): Promise<boolean>;
	delete(request: DeleteRequest): Promise<boolean>;
	freeze(request: FreezeAccountRequest): Promise<boolean>;
	unFreeze(request: FreezeAccountRequest): Promise<boolean>;
	isAccountFrozen(request: FreezeAccountRequest): Promise<boolean>;
	isAccountAssociated(
		request: IsAccountAssociatedTokenRequest,
	): Promise<boolean>;
	getReserveAddress(request: GetReserveAddressRequest): Promise<string>;
	updateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<boolean>;
	grantKyc(request: KYCRequest): Promise<boolean>;
	revokeKyc(request: KYCRequest): Promise<boolean>;
	isAccountKYCGranted(request: KYCRequest): Promise<boolean>;
	transfers(request: TransfersRequest): Promise<boolean>;
	update(request: UpdateRequest): Promise<boolean>;
}

class StableCoinInPort implements IStableCoinInPort {
	constructor(
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly stableCoinService: StableCoinService = Injectable.resolve(
			StableCoinService,
		),
		private readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
		private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	@LogError
	async create(req: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}> {
		handleValidation('CreateRequest', req);
		const {
			hederaTokenManager,
			reserveAddress,
			reserveInitialAmount,
			createReserve,
			proxyAdminOwnerAccount,
		} = req;

		const stableCoinFactory =
			this.networkService.configuration.factoryAddress;

		const coin: StableCoinProps = {
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: PublicKey.NULL,
			initialSupply: BigDecimal.fromString(
				req.initialSupply ?? '0',
				req.decimals,
			),
			maxSupply: req.maxSupply
				? BigDecimal.fromString(req.maxSupply, req.decimals)
				: undefined,
			freezeKey: req.freezeKey
				? new PublicKey({
						key: req.freezeKey.key,
						type: req.freezeKey.type,
				  })
				: undefined,
			freezeDefault: req.freezeDefault,
			wipeKey: req.wipeKey
				? new PublicKey({
						key: req.wipeKey.key,
						type: req.wipeKey.type,
				  })
				: undefined,
			kycKey: req.kycKey
				? new PublicKey({
						key: req.kycKey.key,
						type: req.kycKey.type,
				  })
				: undefined,
			pauseKey: req.pauseKey
				? new PublicKey({
						key: req.pauseKey.key,
						type: req.pauseKey.type,
				  })
				: undefined,
			supplyKey: PublicKey.NULL,
			feeScheduleKey: req.feeScheduleKey
				? new PublicKey({
						key: req.feeScheduleKey.key,
						type: req.feeScheduleKey.type,
				  })
				: undefined,
			treasury: undefined,
			supplyType: req.supplyType,
			autoRenewAccount: undefined,
			burnRoleAccount: new HederaId(req.burnRoleAccount ?? '0.0.0'),
			wipeRoleAccount: new HederaId(req.wipeRoleAccount ?? '0.0.0'),
			rescueRoleAccount: new HederaId(req.rescueRoleAccount ?? '0.0.0'),
			pauseRoleAccount: new HederaId(req.pauseRoleAccount ?? '0.0.0'),
			freezeRoleAccount: new HederaId(req.freezeRoleAccount ?? '0.0.0'),
			deleteRoleAccount: new HederaId(req.deleteRoleAccount ?? '0.0.0'),
			kycRoleAccount: new HederaId(req.kycRoleAccount ?? '0.0.0'),
			cashInRoleAccount: new HederaId(req.cashInRoleAccount ?? '0.0.0'),
			cashInRoleAllowance: BigDecimal.fromString(
				req.cashInRoleAllowance ?? '0',
				req.decimals,
			),
			metadata: req.metadata,
		};

		const stableCoinFactoryId: string | undefined = (
			await this.mirrorNode.getContractInfo(stableCoinFactory)
		).id;

		const hederaTokenManagerId: string | undefined = hederaTokenManager
			? (await this.mirrorNode.getContractInfo(hederaTokenManager)).id
			: undefined;

		const reserveAddressId: string | undefined = reserveAddress
			? (await this.mirrorNode.getContractInfo(reserveAddress)).id
			: undefined;

		const createResponse = await this.commandBus.execute(
			new CreateCommand(
				coin,
				createReserve,
				stableCoinFactoryId
					? new ContractId(stableCoinFactoryId)
					: undefined,
				hederaTokenManagerId
					? new ContractId(hederaTokenManagerId)
					: undefined,
				reserveAddressId ? new ContractId(reserveAddressId) : undefined,
				reserveInitialAmount
					? BigDecimal.fromString(
							reserveInitialAmount,
							RESERVE_DECIMALS,
					  )
					: undefined,
				proxyAdminOwnerAccount
					? new ContractId(proxyAdminOwnerAccount)
					: undefined,
			),
		);
		return {
			coin:
				createResponse.tokenId.toString() !== ContractId.NULL.toString()
					? (
							await this.queryBus.execute(
								new GetStableCoinQuery(createResponse.tokenId),
							)
					  ).coin
					: {},
			reserve: {
				proxyAddress: createResponse.reserveProxy,
				proxyAdminAddress: createResponse.reserveProxyAdmin,
			},
		};
	}

	@LogError
	async getInfo(
		request: GetStableCoinDetailsRequest,
	): Promise<StableCoinViewModel> {
		const { id } = request;
		handleValidation('GetStableCoinDetailsRequest', request);
		const coin = (
			await this.queryBus.execute(
				new GetStableCoinQuery(HederaId.from(id)),
			)
		).coin;
		return coin;
	}

	@LogError
	async cashIn(request: CashInRequest): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		handleValidation('CashInRequest', request);

		return (
			await this.commandBus.execute(
				new CashInCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async burn(request: BurnRequest): Promise<boolean> {
		const { tokenId, amount } = request;
		handleValidation('BurnRequest', request);

		return (
			await this.commandBus.execute(
				new BurnCommand(amount, HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async rescue(request: RescueRequest): Promise<boolean> {
		const { tokenId, amount } = request;
		handleValidation('RescueRequest', request);

		return (
			await this.commandBus.execute(
				new RescueCommand(amount, HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async rescueHBAR(request: RescueHBARRequest): Promise<boolean> {
		const { tokenId, amount } = request;
		handleValidation('RescueHBARRequest', request);

		return (
			await this.commandBus.execute(
				new RescueHBARCommand(amount, HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async wipe(request: WipeRequest): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		handleValidation('WipeRequest', request);

		return (
			await this.commandBus.execute(
				new WipeCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async associate(request: AssociateTokenRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('AssociateTokenRequest', request);

		return (
			await this.commandBus.execute(
				new AssociateCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance> {
		handleValidation('GetAccountBalanceRequest', request);

		const res = await this.queryBus.execute(
			new BalanceOfQuery(
				HederaId.from(request.tokenId),
				HederaId.from(request.targetId),
			),
		);

		return new Balance(res.payload);
	}

	@LogError
	async getBalanceOfHBAR(
		request: GetAccountBalanceHBARRequest,
	): Promise<Balance> {
		handleValidation('GetAccountBalanceHBARRequest', request);

		const res = await this.queryBus.execute(
			new BalanceOfHBARQuery(HederaId.from(request.treasuryAccountId)),
		);

		return new Balance(res.payload);
	}

	@LogError
	async capabilities(
		request: CapabilitiesRequest,
	): Promise<StableCoinCapabilities> {
		handleValidation('CapabilitiesRequest', request);

		const resp = await this.queryBus.execute(
			new GetAccountInfoQuery(HederaId.from(request.account.accountId)),
		);
		return this.stableCoinService.getCapabilities(
			new Account({
				id: resp.account.id ?? request.account.accountId,
				publicKey: resp.account.publicKey,
			}),
			HederaId.from(request.tokenId),
			request.tokenIsPaused,
			request.tokenIsDeleted,
		);
	}

	@LogError
	async pause(request: PauseRequest): Promise<boolean> {
		const { tokenId } = request;
		handleValidation('PauseRequest', request);

		return (
			await this.commandBus.execute(
				new PauseCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async unPause(request: PauseRequest): Promise<boolean> {
		const { tokenId } = request;
		handleValidation('PauseRequest', request);

		return (
			await this.commandBus.execute(
				new UnPauseCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async delete(request: DeleteRequest): Promise<boolean> {
		const { tokenId } = request;
		handleValidation('DeleteRequest', request);

		return (
			await this.commandBus.execute(
				new DeleteCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	@LogError
	async freeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			await this.commandBus.execute(
				new FreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async unFreeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			await this.commandBus.execute(
				new UnFreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async isAccountFrozen(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload?.freezeStatus === FreezeStatus.FROZEN
		);
	}

	@LogError
	async grantKyc(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		return (
			await this.commandBus.execute(
				new GrantKycCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async revokeKyc(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);
		return (
			await this.commandBus.execute(
				new RevokeKycCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async isAccountKYCGranted(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload?.kycStatus === KycStatus.GRANTED
		);
	}

	@LogError
	async isAccountAssociated(
		request: IsAccountAssociatedTokenRequest,
	): Promise<boolean> {
		handleValidation('IsAccountAssociatedTokenRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(request.targetId),
						HederaId.from(request.tokenId),
					),
				)
			).payload !== undefined
		);
	}

	@LogError
	async getReserveAddress(
		request: GetReserveAddressRequest,
	): Promise<string> {
		handleValidation('GetReserveAddressRequest', request);

		return (
			await this.queryBus.execute(
				new GetReserveAddressQuery(HederaId.from(request.tokenId)),
			)
		).payload.toString();
	}

	@LogError
	async updateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<boolean> {
		handleValidation('UpdateReserveAddressRequest', request);

		const reserveAddressId: string = (
			await this.mirrorNode.getContractInfo(request.reserveAddress)
		).id;

		return (
			await this.commandBus.execute(
				new UpdateReserveAddressCommand(
					HederaId.from(request.tokenId),
					new ContractId(reserveAddressId),
				),
			)
		).payload;
	}

	@LogError
	async transfers(request: TransfersRequest): Promise<boolean> {
		const { tokenId, targetsId, amounts, targetId } = request;

		handleValidation('TransfersRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		return (
			await this.commandBus.execute(
				new TransfersCommand(
					amounts,
					targetsIdHederaIds,
					HederaId.from(tokenId),
					HederaId.from(targetId),
				),
			)
		).payload;
	}

	@LogError
	async update(request: UpdateRequest): Promise<boolean> {
		const {
			tokenId,
			name,
			symbol,
			autoRenewPeriod,
			expirationTimestamp,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			metadata,
		} = request;
		handleValidation('UpdateRequest', request);
		return (
			await this.commandBus.execute(
				new UpdateCommand(
					HederaId.from(tokenId),
					name,
					symbol,
					autoRenewPeriod ? Number(autoRenewPeriod) : undefined,
					expirationTimestamp
						? Number(expirationTimestamp)
						: undefined,
					kycKey
						? new PublicKey({
								key: kycKey.key,
								type: kycKey.type,
						  })
						: undefined,
					freezeKey
						? new PublicKey({
								key: freezeKey.key,
								type: freezeKey.type,
						  })
						: undefined,
					feeScheduleKey
						? new PublicKey({
								key: feeScheduleKey.key,
								type: feeScheduleKey.type,
						  })
						: undefined,
					pauseKey
						? new PublicKey({
								key: pauseKey.key,
								type: pauseKey.type,
						  })
						: undefined,
					wipeKey
						? new PublicKey({
								key: wipeKey.key,
								type: wipeKey.type,
						  })
						: undefined,
					metadata,
				),
			)
		).payload;
	}
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
