import ContractId from '../../../../domain/context/contract/ContractId.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import { TokenSupplyType } from '../../../../domain/context/stablecoin/TokenSupply.js';

export interface IStableCoinDetail {
	tokenId: string;
	name: string;
	symbol: string;
	decimals: number;
	totalSupply: string;
	maxSupply: string;
	initialSupply: string;
	// customFee: ICustomFees;
	treasuryId: string;
	// expirationTime: string;
	memo: string;
	// paused: string;
	freezeDefault: boolean;
	// kycStatus: string;
	// deleted: boolean;
	supplyType: TokenSupplyType;
	adminKey: ContractId | PublicKey | undefined;
	kycKey: ContractId | PublicKey | undefined;
	freezeKey: ContractId | PublicKey | undefined;
	wipeKey: ContractId | PublicKey | undefined;
	supplyKey: ContractId | PublicKey | undefined;
	pauseKey: ContractId | PublicKey | undefined;
}
export type IStableCoinDetailResponse = IStableCoinDetail;
