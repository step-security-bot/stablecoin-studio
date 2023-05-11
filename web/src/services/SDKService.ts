import {
	StableCoin,
	Network,
	Account,
	Role,
	CapabilitiesRequest,
	ConnectRequest,
	SetConfigurationRequest,
	InitializationRequest,
	ReserveDataFeed,
	Fees,
	Factory,
	SetNetworkRequest,
	GetAccountsWithRolesRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import type {
	WalletEvent,
	WipeRequest,
	AssociateTokenRequest,
	BurnRequest,
	CashInRequest,
	CheckSupplierLimitRequest,
	CreateRequest,
	DecreaseSupplierAllowanceRequest,
	DeleteRequest,
	FreezeAccountRequest,
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetTokenManagerListRequest,
	GetListStableCoinRequest,
	GetReserveAddressRequest,
	GetReserveAmountRequest,
	GetRolesRequest,
	GetStableCoinDetailsRequest,
	GetSupplierAllowanceRequest,
	GrantMultiRolesRequest,
	HasRoleRequest,
	IncreaseSupplierAllowanceRequest,
	InitializationData,
	KYCRequest,
	PauseRequest,
	RequestAccount,
	RescueRequest,
	RescueHBARRequest,
	ReserveViewModel,
	ResetSupplierAllowanceRequest,
	RevokeMultiRolesRequest,
	StableCoinCapabilities,
	StableCoinListViewModel,
	StableCoinViewModel,
	SupportedWallets,
	UpdateCustomFeesRequest,
	UpdateRequest,
	UpdateReserveAddressRequest,
	UpdateReserveAmountRequest,
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

export class SDKService {
	static initData?: InitializationData = undefined;

	public static isInit() {
		// @ts-ignore
		return !!this.initData;
	}

	public static async connectWallet(wallet: SupportedWallets, connectNetwork: string) {
		await Network.setNetwork(
			new SetNetworkRequest({
				environment: connectNetwork,
			}),
		);

		let factories = [];

		if (process.env.REACT_APP_FACTORIES) factories = JSON.parse(process.env.REACT_APP_FACTORIES);

		const _lastFactoryId =
			factories.length !== 0
				? factories.find((i: any) => i.Environment === connectNetwork)
					? factories.find((i: any) => i.Environment === connectNetwork).STABLE_COIN_FACTORY_ADDRESS
					: ''
				: '';

		if (_lastFactoryId)
			await Network.setConfig(
				new SetConfigurationRequest({
					factoryAddress: _lastFactoryId,
				}),
			);

		this.initData = await Network.connect(
			new ConnectRequest({
				network: connectNetwork,
				wallet,
			}),
		);

		return this.initData;
	}

	public static async init(events: Partial<WalletEvent>) {
		try {
			const init = await Network.init(
				new InitializationRequest({
					network: 'mainnet',
					events,
				}),
			);

			return init;
		} catch (e) {
			console.error('Error initializing the Network : ' + e);
			window.alert(
				'There was an error initializing the network, please check your .env file and make sure the configuration is correct',
			);
		}
	}

	public static getWalletData(): InitializationData | undefined {
		return this.initData;
	}

	public static async disconnectWallet(): Promise<boolean> {
		return await Network.disconnect();
	}

	public static async getStableCoins(
		req: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel | null> {
		return await Account.listStableCoins(req);
	}

	public static async getStableCoinDetails(req: GetStableCoinDetailsRequest) {
		return await StableCoin.getInfo(req);
	}

	public static async getAccountInfo(req: GetAccountInfoRequest) {
		return await Account.getInfo(req);
	}

	public static async cashIn(req: CashInRequest) {
		return await StableCoin.cashIn(req);
	}

	public static async burn(req: BurnRequest) {
		return await StableCoin.burn(req);
	}

	public static async createStableCoin(
		createRequest: CreateRequest,
	): Promise<{ coin: StableCoinViewModel; reserve: ReserveViewModel } | null> {
		return await StableCoin.create(createRequest);
	}

	public static async updateStableCoin(updateRequest: UpdateRequest): Promise<boolean> {
		return await StableCoin.update(updateRequest);
	}

	public static async getBalance(req: GetAccountBalanceRequest) {
		return await StableCoin.getBalanceOf(req);
	}

	public static async rescue(req: RescueRequest) {
		return await StableCoin.rescue(req);
	}

	public static async rescueHBAR(req: RescueHBARRequest) {
		return await StableCoin.rescueHBAR(req);
	}

	public static async wipe(req: WipeRequest) {
		return await StableCoin.wipe(req);
	}

	public static async pause(req: PauseRequest) {
		return await StableCoin.pause(req);
	}

	public static async unpause(req: PauseRequest) {
		return await StableCoin.unPause(req);
	}

	public static async freeze(req: FreezeAccountRequest) {
		return await StableCoin.freeze(req);
	}

	public static async unfreeze(req: FreezeAccountRequest) {
		return await StableCoin.unFreeze(req);
	}

	public static async delete(req: DeleteRequest) {
		return await StableCoin.delete(req);
	}

	public static async getCapabilities({
		account,
		tokenId,
		tokenIsPaused = undefined,
		tokenIsDeleted = undefined,
	}: {
		account: RequestAccount;
		tokenId: string;
		tokenIsPaused?: boolean;
		tokenIsDeleted?: boolean;
	}): Promise<StableCoinCapabilities | null> {
		return await StableCoin.capabilities(
			new CapabilitiesRequest({
				account,
				tokenId,
				tokenIsPaused,
				tokenIsDeleted,
			}),
		);
	}

	public static async increaseSupplierAllowance(req: IncreaseSupplierAllowanceRequest) {
		return await Role.increaseAllowance(req);
	}

	public static async decreaseSupplierAllowance(req: DecreaseSupplierAllowanceRequest) {
		return await Role.decreaseAllowance(req);
	}

	public static async resetSupplierAllowance(req: ResetSupplierAllowanceRequest) {
		return await Role.resetAllowance(req);
	}

	public static async checkSupplierAllowance(req: GetSupplierAllowanceRequest) {
		return await Role.getAllowance(req);
	}

	public static async grantMultipleRole(req: GrantMultiRolesRequest) {
		return await Role.grantMultiRoles(req);
	}

	public static async revokeMultiRolesRequest(req: RevokeMultiRolesRequest) {
		return await Role.revokeMultiRoles(req);
	}

	public static async hasRole(req: HasRoleRequest) {
		return await Role.hasRole(req);
	}

	public static async isUnlimitedSupplierAllowance(req: CheckSupplierLimitRequest) {
		return await Role.isUnlimited(req);
	}

	public static async getRoles(data: GetRolesRequest) {
		return await Role.getRoles(data);
	}

	public static async getAccountsWithRole(data: GetAccountsWithRolesRequest) {
		return await Role.getAccountsWithRole(data);
	}

	public static async getReserveAddress(data: GetReserveAddressRequest) {
		return await StableCoin.getReserveAddress(data);
	}

	public static async getReserveAmount(data: GetReserveAmountRequest) {
		return await ReserveDataFeed.getReserveAmount(data);
	}

	public static async updateReserveAddress(data: UpdateReserveAddressRequest) {
		return await StableCoin.updateReserveAddress(data);
	}

	public static async updateReserveAmount(data: UpdateReserveAmountRequest) {
		return await ReserveDataFeed.updateReserveAmount(data);
	}

	public static async grantKyc(data: KYCRequest) {
		return await StableCoin.grantKyc(data);
	}

	public static async revokeKyc(data: KYCRequest) {
		return await StableCoin.revokeKyc(data);
	}

	public static async isAccountKYCGranted(data: KYCRequest) {
		return await StableCoin.isAccountKYCGranted(data);
	}

	public static async associate(data: AssociateTokenRequest) {
		return await StableCoin.associate(data);
	}

	public static async addFixedFee(data: AddFixedFeeRequest) {
		return await Fees.addFixedFee(data);
	}

	public static async addFractionalFee(data: AddFractionalFeeRequest) {
		return await Fees.addFractionalFee(data);
	}

	public static async updateCustomFees(data: UpdateCustomFeesRequest) {
		return await Fees.updateCustomFees(data);
	}

	public static async getHederaTokenManagerList(data: GetTokenManagerListRequest) {
		return await Factory.getHederaTokenManagerList(data);
	}
}

export default SDKService;
