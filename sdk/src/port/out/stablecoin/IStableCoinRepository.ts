import { StableCoinRole } from '../../../core/enum.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';

export default interface IStableCoinRepository {
	saveCoin(
		accountId: AccountId,
		coin: StableCoin,
		privateKey?: PrivateKey,
	): Promise<StableCoin>;
	getListStableCoins(privateKey?: PrivateKey): Promise<IStableCoinList[]>;
	getStableCoin(id: AccountId): Promise<StableCoin>;
	getBalanceOf(
		treasuryId: ContractId,
		accountId: AccountId,
		targetId: AccountId,
		tokenId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	getTokenOwnerBalance(
		treasuryId: ContractId,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	getNameToken(
		treasuryId: ContractId,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	cashIn(
		treasuryId: ContractId,
		accountId: AccountId,
		targetId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	cashOut(
		treasuryId: ContractId,
		accountId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	associateToken(
		treasuryId: ContractId,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	wipe(
		treasuryId: ContractId,
		accountId: AccountId,
		targetId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	grantSupplierRole(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
		amount?: number,
	): Promise<Uint8Array>;
	isUnlimitedSupplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	supplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	revokeSupplierRole(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	resetSupplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	increaseSupplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	decreaseSupplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	isLimitedSupplierAllowance(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	rescue(
		treasuryId: ContractId,
		accountId: AccountId,
		amount: number,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	grantRole(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		role: StableCoinRole,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	revokeRole(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		role: StableCoinRole,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
	hasRole(
		treasuryId: ContractId,
		address: string,
		accountId: AccountId,
		role: StableCoinRole,
		privateKey?: PrivateKey,
	): Promise<Uint8Array>;
}
