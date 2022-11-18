import Service from '../Service.js';
import ICreateStableCoinServiceRequestModel from './model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from './model/IListStableCoinServiceRequestModel.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import StableCoinList from '../../../port/in/sdk/response/StableCoinList.js';
import IGetStableCoinServiceRequestModel from './model/IGetStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from './model/IGetBalanceOfStableCoinServiceRequestModel.js';
import CashInStableCoinServiceRequestModel from './model/ICashInStableCoinServiceRequestModel.js';
import ICashOutStableCoinServiceRequestModel from './model/ICashOutStableCoinServiceRequestModel.js';
import AssociateTokenStableCoinServiceRequestModel from './model/IAssociateTokenStableCoinServiceRequestModel.js';
import IWipeStableCoinServiceRequestModel from './model/IWipeStableCoinServiceRequestModel.js';
import IStableCoinRepository from '../../../port/out/stablecoin/IStableCoinRepository.js';
import IRescueStableCoinServiceRequestModel from './model/IRescueStableCoinServiceRequestModel.js';
import IRoleStableCoinServiceRequestModel from './model/IRoleStableCoinServiceRequestModel';
import IGetBasicRequestModel from './model/IGetBasicRequest.js';
import ISupplierRoleStableCoinServiceRequestModel from './model/ISupplierRoleStableCoinServiceRequestModel.js';
import StableCoinDetail from '../../../port/in/sdk/response/StableCoinDetail.js';
import AccountInfo from '../../../port/in/sdk/response/AccountInfo.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { IAccountWithKeyRequestModel } from './model/CoreRequestModel.js';
import IGetSupplierAllowanceModel from './model/IGetSupplierAllowanceModel.js';
import BigDecimal from '../../../domain/context/stablecoin/BigDecimal.js';
import IGetRolesServiceRequestModel from './model/IGetRolesServiceRequest';
import { InvalidRange } from '../../../port/in/sdk/request/error/InvalidRange.js';
import { AmountGreaterThanAllowedSupply } from './error/AmountGreaterThanAllowedSupply.js';
import { OperationNotAllowed } from './error/OperationNotAllowed.js';
import { InsufficientFunds } from './error/InsufficientFunds.js';
import { AmountGreaterThanOwnerBalance } from './error/AmountGreaterThanOwnerBalance.js';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import IDeleteStableCoinRequestModel from './model/IDeleteStableCoinRequestModel.js';
import IPauseStableCoinRequestModel from './model/IPauseStableCoinRequestModel.js';

export default class StableCoinService extends Service {
	private repository: IStableCoinRepository;

	constructor(repository: IStableCoinRepository) {
		super();
		this.repository = repository;
	}

	/**
	 * createStableCoin
	 */
	public async createStableCoin(
		req: ICreateStableCoinServiceRequestModel,
	): Promise<StableCoinDetail> {
		if (
			req.maxSupply &&
			req.initialSupply &&
			req.initialSupply.isGreaterThan(req.maxSupply)
		) {
			throw new InvalidRange(
				'Initial supply cannot be more than the max supply',
			);
		}
		let coin: StableCoin = new StableCoin({
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: req.adminKey,
			initialSupply: req.initialSupply ? req.initialSupply : undefined,
			maxSupply: req.maxSupply ? req.maxSupply : undefined,
			memo: req.memo,
			freezeKey: req.freezeKey,
			freezeDefault: req.freezeDefault,
			kycKey: req.KYCKey,
			wipeKey: req.wipeKey,
			pauseKey: req.pauseKey,
			supplyKey: req.supplyKey,
			treasury: req.treasury,
			tokenType: req.tokenType,
			supplyType: req.supplyType,
			id: req.id,
			autoRenewAccount: req.autoRenewAccount,
		});
		coin = await this.repository.saveCoin(coin, req.account);
		return this.getStableCoinDetails({ id: coin.id });
	}

	/**
	 * getListStableCoins
	 */
	public async getListStableCoins(
		req: IListStableCoinServiceRequestModel,
	): Promise<StableCoinList[]> {
		return this.repository.getListStableCoins(req.account);
	}

	public async getStableCoinDetails(
		req: IGetStableCoinServiceRequestModel,
	): Promise<StableCoinDetail> {
		const stableCoin: StableCoin = await this.getStableCoin(req);
		const stableCoinDetails: StableCoinDetail = {
			tokenId: stableCoin.id,
			name: stableCoin.name,
			symbol: stableCoin.symbol,
			decimals: stableCoin.decimals,
			totalSupply: stableCoin.totalSupply.toString(),
			maxSupply: stableCoin.maxSupply?.isZero()
				? 'INFINITE'
				: stableCoin.maxSupply?.toString(),
			initialSupply: stableCoin.initialSupply.toString(),
			// customFee:stableCoin.,
			treasuryId: stableCoin.treasury.id,
			freezeDefault: stableCoin.freezeDefault,
			paused: stableCoin.paused,
			memo: stableCoin.memo,
			// kycStatus: string;
			deleted: stableCoin.deleted,
			autoRenewAccount: stableCoin.autoRenewAccount,
			autoRenewAccountPeriod: stableCoin.autoRenewAccountPeriod,
			adminKey: stableCoin.adminKey,
			kycKey: stableCoin.kycKey,
			freezeKey: stableCoin.freezeKey,
			wipeKey: stableCoin.wipeKey,
			supplyKey: stableCoin.supplyKey,
			pauseKey: stableCoin.pauseKey,
		};
		return stableCoinDetails;
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(
		req: IGetStableCoinServiceRequestModel,
	): Promise<StableCoin> {
		return this.repository.getStableCoin(req.id);
	}

	public async getCapabilitiesStableCoin(
		id: string,
		publickey: string,
	): Promise<Capabilities[]> {
		return this.repository.getCapabilitiesStableCoin(id, publickey);
	}

	public async getBalanceOf(
		req: IGetBalanceOfStableCoinServiceRequestModel,
	): Promise<string> {
		return this.repository.getBalanceOf(
			req.proxyContractId,
			req.targetId,
			req.tokenId,
			req.account,
		);
	}

	public async cashIn(
		req: CashInStableCoinServiceRequestModel,
	): Promise<boolean> {
		// TODO validation
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		if (CheckNums.hasMoreDecimals(req.amount, coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), cash in`,
			);
		}
		const amount = BigDecimal.fromString(req.amount, coin.decimals);
		if (
			coin.maxSupply &&
			coin.maxSupply.isGreaterThan(BigDecimal.ZERO) &&
			amount.isGreaterThan(coin.maxSupply.subUnsafe(coin.totalSupply))
		) {
			console.log(coin.maxSupply, coin.totalSupply, amount);
			throw new AmountGreaterThanAllowedSupply(amount);
		}

		let resultCashIn = false;

		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.publicKey
					? req.publicKey?.key
					: req.account?.privateKey?.publicKey?.key ?? '',
			);
		if (capabilities.includes(Capabilities.CASH_IN)) {
			const result = await this.repository.cashIn(
				req.proxyContractId,
				req.targetId,
				amount,
				req.account,
			);
			resultCashIn = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.CASH_IN_HTS)) {
			resultCashIn = await this.repository.cashInHTS(
				req.tokenId,
				amount,
				req.account,
			);

			if (resultCashIn && coin.treasury.id != req.targetId) {
				if (coin.treasury.id === req?.account?.accountId.id) {
					resultCashIn = await this.repository.transferHTS(
						req.tokenId,
						amount,
						coin.treasury.id,
						req.targetId,
						req.account,
						false,
					);
				} else {
					resultCashIn = await this.repository.transferHTS(
						req.tokenId,
						amount,
						coin.treasury.id,
						req.targetId,
						req.account,
						true,
					);
				}
			}
		} else {
			throw new OperationNotAllowed('Cash in');
		}
		return resultCashIn;
	}

	public async cashOut(
		req: ICashOutStableCoinServiceRequestModel,
	): Promise<boolean> {
		// TODO validate
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const treasruyAccount: string = coin.treasury.id;
		if (CheckNums.hasMoreDecimals(req.amount, coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), burn`,
			);
		}
		const amount = BigDecimal.fromString(req.amount, coin.decimals);

		const treasuryAccountBalance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: treasruyAccount,
			tokenId: req.tokenId,
		});
		const treasuryAccountBalanceBigDecimal = BigDecimal.fromString(
			treasuryAccountBalance.toString(),
			coin.decimals,
		);
		if (amount.isGreaterThan(treasuryAccountBalanceBigDecimal)) {
			throw new OperationNotAllowed(
				'The treasury account balance is bigger than the amount, burn',
			);
		}

		let resultCashOut = false;
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.publicKey
					? req.publicKey?.key
					: req.account?.privateKey?.publicKey?.key ?? '',
			);
		if (capabilities.includes(Capabilities.BURN)) {
			const result = await this.repository.cashOut(
				req.proxyContractId,
				amount,
				req.account,
			);
			resultCashOut = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.BURN_HTS)) {
			resultCashOut = await this.repository.cashOutHTS(
				req.tokenId,
				amount,
				req.account,
			);
		} else {
			throw new OperationNotAllowed('Cash out');
		}
		return resultCashOut;
	}

	public async associateToken(
		req: AssociateTokenStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.associateToken(req.proxyContractId, req.account);
	}

	public async wipe(
		req: IWipeStableCoinServiceRequestModel,
	): Promise<boolean> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		if (coin.treasury.id == req.targetId) {
			throw new OperationNotAllowed(
				'Wiping tokens from the treasury account',
			);
		}

		// Balances

		const balance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: req.targetId,
			tokenId: req.tokenId,
		});

		if (CheckNums.hasMoreDecimals(req.amount, coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), wipe`,
			);
		}

		const amount = BigDecimal.fromString(req.amount, coin.decimals);

		const balanceBigDecimal = BigDecimal.fromString(
			balance.toString(),
			coin.decimals,
		);
		if (balanceBigDecimal.isLowerThan(amount)) {
			throw new InsufficientFunds(req.targetId);
		}

		let resultWipe = false;
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		if (capabilities.includes(Capabilities.WIPE)) {
			const result = await this.repository.wipe(
				req.proxyContractId,
				req.targetId,
				amount,
				req.account,
			);
			resultWipe = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.WIPE_HTS)) {
			resultWipe = await this.repository.wipeHTS(
				req.tokenId,
				req.targetId,
				amount,
				req.account,
			);
		} else {
			throw new OperationNotAllowed('Wipe');
		}

		return resultWipe;
	}

	public async rescue(
		req: IRescueStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		const treasruyAccount: string = coin.treasury.id;
		if (CheckNums.hasMoreDecimals(req.amount, coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), rescue`,
			);
		}
		const amount = BigDecimal.fromString(req.amount, coin.decimals);

		const treasuryAccountBalance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: treasruyAccount,
			tokenId: req.tokenId,
		});

		const treasuryBigDecimal = BigDecimal.fromString(
			treasuryAccountBalance.toString(),
			coin.decimals,
		);
		if (amount.isGreaterThan(treasuryBigDecimal)) {
			throw new AmountGreaterThanOwnerBalance(treasuryBigDecimal);
		}
		return this.repository.rescue(req.proxyContractId, amount, req.account);
	}

	public async grantSupplierRole(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		return this.repository.grantSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.account,
			req.amount
				? BigDecimal.fromString(req.amount, coin.decimals)
				: undefined,
		);
	}

	public async isUnlimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isUnlimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async supplierAllowance(
		req: IGetSupplierAllowanceModel,
	): Promise<string> {
		const response = await this.repository.supplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		return BigDecimal.fromStringFixed(
			response[0].toString(),
			coin.decimals,
		).toString();
	}

	public async revokeSupplierRole(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async resetSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.resetSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async increaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		if (CheckNums.hasMoreDecimals(req.amount ?? '', coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), increase supplier allowance `,
			);
		}
		return this.repository.increaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
			req.amount
				? BigDecimal.fromString(req.amount, coin.decimals)
				: BigDecimal.ZERO,
		);
	}

	public async decreaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		const limit = await this.supplierAllowance({
			proxyContractId: req.proxyContractId,
			targetId: req.targetId,
			account: req.account,
			tokenId: req.tokenId,
		}).then((r) => BigDecimal.fromString(r, coin.decimals));

		if (CheckNums.hasMoreDecimals(req.amount ?? '', coin.decimals)) {
			throw new OperationNotAllowed(
				`The amount has more decimals than the limit (${coin.decimals}), decrease supplier allowance`,
			);
		}

		const amount = req.amount
			? BigDecimal.fromString(req.amount, coin.decimals)
			: BigDecimal.ZERO;

		if (req.amount && limit.isLowerThan(amount)) {
			throw new OperationNotAllowed(
				'To be able to decrease the limit, at most the amount must be equal to the current limit. Since the indicated amount is higher than the current limit, decreasing the limit',
			);
		}

		return this.repository.decreaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
			amount,
		);
	}

	public async isLimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isLimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async grantRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.grantRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}

	public async revokeRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}

	public async hasRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.hasRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}

	public async getAccountInfo(
		req: IAccountWithKeyRequestModel,
	): Promise<AccountInfo> {
		return this.repository.getAccountInfo(req.account.accountId.id);
	}

	public async getRoles(
		req: IGetRolesServiceRequestModel,
	): Promise<string[]> {
		return this.repository.getRoles(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async deleteStableCoin(
		req: IDeleteStableCoinRequestModel,
	): Promise<boolean> {
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		let result = false;
		if (capabilities.includes(Capabilities.DELETE)) {
			result = Boolean(
				await this.repository
					.delete(req.proxyContractId, req.account)
					.then((r) => r[0]),
			);
		} else if (capabilities.includes(Capabilities.DELETE_HTS)) {
			result = await this.repository.deleteHTS(req.tokenId, req.account);
		}
		return result;
	}

	public async pauseStableCoin(
		req: IPauseStableCoinRequestModel,
	): Promise<boolean> {
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		let result = false;
		if (capabilities.includes(Capabilities.PAUSE)) {
			result = Boolean(
				await this.repository
					.pause(req.proxyContractId, req.account)
					.then((r) => r[0]),
			);
		} else if (capabilities.includes(Capabilities.PAUSE_HTS)) {
			result = await this.repository.pauseHTS(req.tokenId, req.account);
		}
		return result;
	}

	public async unpauseStableCoin(
		req: IPauseStableCoinRequestModel,
	): Promise<boolean> {
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		let result = false;
		if (capabilities.includes(Capabilities.PAUSE)) {
			result = Boolean(
				await this.repository
					.unpause(req.proxyContractId, req.account)
					.then((r) => r[0]),
			);
		} else if (capabilities.includes(Capabilities.PAUSE_HTS)) {
			result = await this.repository.unpauseHTS(req.tokenId, req.account);
		}
		return result;
	}
}
