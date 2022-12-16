/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { HTSTransactionAdapter } from '../../../../../src/port/out/hs/hts/HTSTransactionAdapter.js';
import TransactionResponse from '../../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import { StableCoin } from '../../../../../src/domain/context/stablecoin/StableCoin.js';
import Account from '../../../../../src/domain/context/account/Account.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../../src/domain/context/stablecoin/Capability.js';
import BigDecimal from '../../../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../src/domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../src/domain/context/stablecoin/StableCoinRole.js';
import PrivateKey from '../../../../../src/domain/context/account/PrivateKey.js';
import Injectable from '../../../../../src/core/Injectable.js';
import { Network } from '../../../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../../../src/port/in/request/ConnectRequest.js';
import {HederaERC20AddressTestnet, FactoryAddressTestnet, TokenSupplyType} from '../../../../../src/port/in/StableCoin.js';
import PublicKey from '../../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../../src/domain/context/contract/ContractId.js';


describe('🧪 [ADAPTER] HTSTransactionAdapter with Ed25519 accounts', () => {
	const clientAccountId = '0.0.47792863';
	const clientPrivateKey =
		'302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
	const accountId = '0.0.47793222';
	const account: Account = new Account({
		id: clientAccountId,
		privateKey: new PrivateKey({ key: clientPrivateKey, type: 'ED25519' }),
	});

	// token to operate through HTS
	const tokenId = '0.0.48987373';
	const proxyContractId = '0.0.48987372';
	const stableCoin = new StableCoin({
		name: 'HEDERACOIN',
		symbol: 'HDC',
		decimals: 6,
		tokenId: new HederaId(tokenId),
		proxyAddress: new HederaId(proxyContractId),
	});
	const capabilities: Capability[] = [
		new Capability(Operation.CASH_IN, Access.HTS),
		new Capability(Operation.BURN, Access.HTS),
		new Capability(Operation.WIPE, Access.HTS),
		new Capability(Operation.FREEZE, Access.HTS),
		new Capability(Operation.UNFREEZE, Access.HTS),
		new Capability(Operation.PAUSE, Access.HTS),
		new Capability(Operation.UNPAUSE, Access.HTS),
	];
	const stableCoinCapabilities = new StableCoinCapabilities(
		stableCoin,
		capabilities,
		account,
	);

	// token to operate through contract
	const tokenId2 = '0.0.49013686';
	const proxyContractId2 = '0.0.49013685';
	const stableCoin2 = new StableCoin({
		name: 'HEDERACOIN',
		symbol: 'HDC',
		decimals: 4,
		tokenId: new HederaId(tokenId2),
		proxyAddress: new HederaId(proxyContractId2),
	});
	const capabilities2: Capability[] = [
		new Capability(Operation.CASH_IN, Access.CONTRACT),
		new Capability(Operation.BURN, Access.CONTRACT),
		new Capability(Operation.WIPE, Access.CONTRACT),
		new Capability(Operation.RESCUE, Access.CONTRACT),
		new Capability(Operation.FREEZE, Access.CONTRACT),
		new Capability(Operation.UNFREEZE, Access.CONTRACT),
		new Capability(Operation.PAUSE, Access.CONTRACT),
		new Capability(Operation.UNPAUSE, Access.CONTRACT),
		new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
	];
	const stableCoinCapabilities2 = new StableCoinCapabilities(
		stableCoin2,
		capabilities2,
		account,
	);

	let th: HTSTransactionAdapter;
	let tr: TransactionResponse;
	beforeAll(async () => {
		await initTest(account);
		th = Injectable.resolve(HTSTransactionAdapter);
	});

	it('create coin and assign to SC', async () => {
		const coin = new StableCoin({
			name: "TestCoinSC",
			symbol: "TCSC",
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			freezeDefault: false,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			autoRenewAccount: account.id, 
			supplyType: TokenSupplyType.INFINITE

		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet)
		);
		
	}, 50000);

	it('create coin and assign to account', async () => {
		const coin = new StableCoin({
			name: "TestCoinAccount",
			symbol: "TCA",
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			freezeKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			kycKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			wipeKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			pauseKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			supplyKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ED25519'),
			autoRenewAccount: account.id,
			supplyType: TokenSupplyType.FINITE
		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet)
		);
		
	}, 50000);

	it('Test cashin', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		tr = await th.cashin(
			stableCoinCapabilities,
			account.id,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		tr = await th.transfer(
			stableCoinCapabilities,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
			account,
			account.id,
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance + 1);
	}, 50000);

	it('Test burn', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		tr = await th.burn(
			stableCoinCapabilities,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 50000);

	it('Test wipe', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		tr = await th.wipe(
			stableCoinCapabilities,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 50000);

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilities, account.id);
	}, 20000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilities, account.id);
	}, 20000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilities);
	}, 20000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilities);
	}, 20000);

	it('Test cashIn contract function', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		tr = await th.cashin(
			stableCoinCapabilities2,
			account.id,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance + 1);
	}, 20000);

	it('Test burn contract function', async () => {
		const accountFromProxyContractId2 = HederaId.from(proxyContractId2);
		const accountInitialBalance: number = +(
			await th.balanceOf(
				stableCoinCapabilities2,
				accountFromProxyContractId2,
			)
		).response;
		tr = await th.burn(
			stableCoinCapabilities2,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(
				stableCoinCapabilities2,
				accountFromProxyContractId2,
			)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 20000);

	it('Test wipe contract function', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		tr = await th.wipe(
			stableCoinCapabilities2,
			account.id,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 20000);

	it('Test rescue contract function', async () => {
		tr = await th.rescue(
			stableCoinCapabilities2,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
	});

	it('Test freeze contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.freeze(stableCoinCapabilities2, accountFromAccountId);
	});

	it('Test unfreeze contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.unfreeze(stableCoinCapabilities2, accountFromAccountId);
	});

	it('Test pause contract function', async () => {
		tr = await th.pause(stableCoinCapabilities2);
	});

	it('Test unpause contract function', async () => {
		tr = await th.unpause(stableCoinCapabilities2);
	});

	it('Test grant role contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);

		tr = await th.grantRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(true);
	}, 10000);

	it('Test revoke role contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(false);
	}, 10000);

	it('Test get roles contract function', async () => {
		tr = await th.getRoles(stableCoinCapabilities2, account.id);
		expect(tr.response).toEqual([
			StableCoinRole.DEFAULT_ADMIN_ROLE,
			StableCoinRole.CASHIN_ROLE,
			StableCoinRole.BURN_ROLE,
			StableCoinRole.WIPE_ROLE,
			StableCoinRole.RESCUE_ROLE,
			StableCoinRole.PAUSE_ROLE,
			StableCoinRole.FREEZE_ROLE,
			StableCoinRole.DELETE_ROLE,
		]);
	});

	it('Test supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('0');
	});

	it('Test increase supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.grantSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('10', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('11');
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test decrease supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('10');
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test reset supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('0');
	}, 20000);

	it('Test grant unlimited supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(true);
	}, 20000);
});

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	const clientAccountId = '0.0.49032538';
	const clientPrivateKey =
		'305d4d5de3c94df00069916ab28f7650d378be35c88698682025f500f321461c';
	const accountId = '0.0.49069513';
	const account: Account = new Account({
		id: clientAccountId,
		privateKey: new PrivateKey({ key: clientPrivateKey, type: 'ECDSA' }),
	});

	// token to operate through HTS
	const tokenId = '0.0.49069577';
	const proxyContractId = '0.0.49069576';
	const stableCoin = new StableCoin({
		name: 'HEDERACOIN',
		symbol: 'HDC',
		decimals: 3,
		tokenId: new HederaId(tokenId),
		proxyAddress: new HederaId(proxyContractId),
	});
	const capabilities: Capability[] = [
		new Capability(Operation.CASH_IN, Access.HTS),
		new Capability(Operation.BURN, Access.HTS),
		new Capability(Operation.WIPE, Access.HTS),
		new Capability(Operation.FREEZE, Access.HTS),
		new Capability(Operation.UNFREEZE, Access.HTS),
		new Capability(Operation.PAUSE, Access.HTS),
		new Capability(Operation.UNPAUSE, Access.HTS),
	];
	const stableCoinCapabilities = new StableCoinCapabilities(
		stableCoin,
		capabilities,
		account,
	);

	// token to operate through contract
	const tokenId2 = '0.0.49069570';
	const proxyContractId2 = '0.0.49069568';
	const stableCoin2 = new StableCoin({
		name: 'HEDERACOIN',
		symbol: 'HDC',
		decimals: 3,
		tokenId: new HederaId(tokenId2),
		proxyAddress: new HederaId(proxyContractId2),
	});
	const capabilities2: Capability[] = [
		new Capability(Operation.CASH_IN, Access.CONTRACT),
		new Capability(Operation.BURN, Access.CONTRACT),
		new Capability(Operation.WIPE, Access.CONTRACT),
		new Capability(Operation.RESCUE, Access.CONTRACT),
		new Capability(Operation.FREEZE, Access.CONTRACT),
		new Capability(Operation.UNFREEZE, Access.CONTRACT),
		new Capability(Operation.PAUSE, Access.CONTRACT),
		new Capability(Operation.UNPAUSE, Access.CONTRACT),
		new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
	];
	const stableCoinCapabilities2 = new StableCoinCapabilities(
		stableCoin2,
		capabilities2,
		account,
	);

	let th: HTSTransactionAdapter;
	let tr: TransactionResponse;
	beforeAll(async () => {
		await initTest(account);
		th = Injectable.resolve(HTSTransactionAdapter);
	});

	it('create coin and assign to account', async () => {
		const coin = new StableCoin({
			name: "TestCoinAccount",
			symbol: "TCA",
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			freezeKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			kycKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			wipeKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			pauseKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			supplyKey: PublicKey.fromPrivateKey(clientPrivateKey, 'ECDSA'),
			autoRenewAccount: account.id,
			supplyType: TokenSupplyType.FINITE
		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet)
		);
		
	}, 50000);

	it('Test cashin', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		tr = await th.cashin(
			stableCoinCapabilities,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		tr = await th.transfer(
			stableCoinCapabilities,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
			account,
			accountFromAccountId,
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance + 1);
	}, 50000);

	it('Test burn', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		tr = await th.burn(
			stableCoinCapabilities,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 50000);

	it('Test wipe', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		tr = await th.wipe(
			stableCoinCapabilities,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities, accountFromAccountId)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 50000);

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilities, account.id);
	}, 20000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilities, account.id);
	}, 20000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilities);
	}, 20000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilities);
	}, 20000);

	it('Test cashIn contract function', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		tr = await th.cashin(
			stableCoinCapabilities2,
			account.id,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance + 1);
	}, 20000);

	it('Test burn contract function', async () => {
		const accountFromProxyContractId2: Account = new Account({
			id: proxyContractId2,
		});
		const accountInitialBalance: number = +(
			await th.balanceOf(
				stableCoinCapabilities2,
				accountFromProxyContractId2.id,
			)
		).response;
		tr = await th.burn(
			stableCoinCapabilities2,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(
				stableCoinCapabilities2,
				accountFromProxyContractId2.id,
			)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 30000);

	it('Test wipe contract function', async () => {
		const accountInitialBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		tr = await th.wipe(
			stableCoinCapabilities2,
			account.id,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		const accountFinalBalance: number = +(
			await th.balanceOf(stableCoinCapabilities2, account.id)
		).response;
		expect(accountFinalBalance).toEqual(accountInitialBalance - 1);
	}, 20000);

	it('Test rescue contract function', async () => {
		tr = await th.rescue(
			stableCoinCapabilities2,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
	});

	it('Test freeze contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.freeze(stableCoinCapabilities2, accountFromAccountId);
	});

	it('Test unfreeze contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.unfreeze(stableCoinCapabilities2, accountFromAccountId);
	});

	it('Test pause contract function', async () => {
		tr = await th.pause(stableCoinCapabilities2);
	});

	it('Test unpause contract function', async () => {
		tr = await th.unpause(stableCoinCapabilities2);
	});

	it('Test grant role contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);

		tr = await th.grantRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(true);
	}, 10000);

	it('Test revoke role contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(false);
	}, 10000);

	it('Test get roles contract function', async () => {
		tr = await th.getRoles(stableCoinCapabilities2, account.id);
		expect(tr.response).toEqual([
			StableCoinRole.DEFAULT_ADMIN_ROLE,
			StableCoinRole.CASHIN_ROLE,
			StableCoinRole.BURN_ROLE,
			StableCoinRole.WIPE_ROLE,
			StableCoinRole.RESCUE_ROLE,
			StableCoinRole.PAUSE_ROLE,
			StableCoinRole.FREEZE_ROLE,
			StableCoinRole.WITHOUT_ROLE,
		]);
	});

	it('Test supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('0');
	});

	it('Test increase supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.grantSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('10', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('11');
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test decrease supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
			BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('10');
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test reset supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual('0');
	}, 20000);

	it('Test grant unlimited supplier allowance contract function', async () => {
		const accountFromAccountId = HederaId.from(accountId);
		tr = await th.revokeSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilities2,
			accountFromAccountId,
		);
		expect(tr.response).toEqual(true);
	}, 20000);
});

async function initTest(account: Account): Promise<void> {
	await Network.connect(
		new ConnectRequest({
			account: {
				accountId: account.id.toString(),
				evmAddress: account.evmAddress,
				privateKey: account.privateKey,
			},
			network: 'testnet',
			wallet: SupportedWallets.CLIENT,
		}),
	);
}
