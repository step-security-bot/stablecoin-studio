import { AccountId, ContractId, PrivateKey, StableCoinRole } from '../sdk.js';

export interface IRequestContracts {
	proxyContractId: ContractId;
	privateKey?: PrivateKey;
	accountId: AccountId;
}
export interface IRequestContractsAmount extends IRequestContracts {
	amount: number;
}

export interface IRequestBalanceOf extends IRequestContracts {
	targetId: AccountId;
}

export interface ITokenIdRequestModel {
	tokenId: AccountId;
}

export interface ITargetIdRequestModel {
	targetId: AccountId;
}

export interface IRequestRole extends IRequestContracts, ITargetIdRequestModel {
	role: StableCoinRole;
	amount?: number;
}

export interface IAllowanceRequest
	extends IRequestContracts,
		ITargetIdRequestModel {
	amount: number;
}
