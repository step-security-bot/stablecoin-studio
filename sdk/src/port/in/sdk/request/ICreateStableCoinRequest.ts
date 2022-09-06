import Account from '../../../../domain/context/account/Account.js';

export interface ICreateStableCoinRequest {
	account: Account;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freeze?: string;
	freezeDefault?: boolean;
}
