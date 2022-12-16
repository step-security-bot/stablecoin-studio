/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../src/domain/context/stablecoin/Capability.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet } from 'ethers';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../src/domain/context/contract/ContractId.js';
import {
	HederaERC20AddressTestnet,
	FactoryAddressTestnet,
	TokenSupplyType,
} from '../../../../src/port/in/StableCoin.js';

const evmAddress = '0x320d33046b60dbc5a027cfb7e4124f75b0417240';
const clientPrivateKey =
	'1404d4a4a67fb21e7181d147bfdaa7c9b55ebeb7e1a9048bf18d5da6e169c09c';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	const stableCoinCapabilitiesHTS = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HTSECDSA',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006492'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc79c',
			tokenId: HederaId.from('0.0.49006494'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.HTS),
			new Capability(Operation.BURN, Access.HTS),
			new Capability(Operation.WIPE, Access.HTS),
			new Capability(Operation.FREEZE, Access.HTS),
			new Capability(Operation.UNFREEZE, Access.HTS),
			new Capability(Operation.PAUSE, Access.HTS),
			new Capability(Operation.UNPAUSE, Access.HTS),
			new Capability(Operation.DELETE, Access.HTS),
			new Capability(Operation.RESCUE, Access.HTS),
			new Capability(Operation.ROLE_MANAGEMENT, Access.HTS),
		],
		CLIENT_ACCOUNT_ECDSA,
	);
	const stableCoinCapabilitiesSC = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HDC',
			decimals: 3,
			proxyAddress: HederaId.from('0.0.49072315'),
			evmProxyAddress: '0x0000000000000000000000000000000002ecc8bb',
			tokenId: HederaId.from('0.0.49072316'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.CONTRACT),
			new Capability(Operation.BURN, Access.CONTRACT),
			new Capability(Operation.WIPE, Access.CONTRACT),
			new Capability(Operation.FREEZE, Access.CONTRACT),
			new Capability(Operation.UNFREEZE, Access.CONTRACT),
			new Capability(Operation.PAUSE, Access.CONTRACT),
			new Capability(Operation.UNPAUSE, Access.CONTRACT),
			new Capability(Operation.DELETE, Access.CONTRACT),
			new Capability(Operation.RESCUE, Access.CONTRACT),
			new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
		],
		CLIENT_ACCOUNT_ECDSA,
	);

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;

	beforeAll(async () => {
		th = Injectable.resolve(RPCTransactionAdapter);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.setEnvironment('testnet');
	});

	it('create coin and assign to SC', async () => {
		const coin = new StableCoin({
			name: 'TestCoinSC',
			symbol: 'TCSC',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			freezeDefault: false,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			autoRenewAccount: accountFromAEvmAddress.id,
			supplyType: TokenSupplyType.INFINITE,
		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
		);
	}, 1500000);

	it('create coin and assign to account', async () => {
		const coin = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
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
			autoRenewAccount: accountFromAEvmAddress.id,
			supplyType: TokenSupplyType.FINITE,
		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
		);
	}, 1500000);

	it('Test hasRole', async () => {
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
	}, 1500000);

	it('Test mint', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
	}, 1500000);

	it('Test wipe', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test mint HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test rescue', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	//it('Test delete', async () => {
	//	tr = await th.delete(stableCoinCapabilitiesSC);
	//}, 1500000);

	it('Test revokeRole', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantRole', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantSupplierRole', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);

		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test revokeSupplierRole', async () => {
		tr = await th.revokeSupplierRole(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test grantUnlimitedSupplierRole', async () => {
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test hasRole (2)', async () => {
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
	}, 1500000);

	it('Test getBalanceOf', async () => {
		tr = await th.balanceOf(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test isUnlimitedSupplierAllowance', async () => {
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
		);
	}, 1500000);

	it('Test supplierAllowance', async () => {
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test resetSupplierAllowance', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
		);
	}, 1500000);

	it('Test increaseSupplierAllowance', async () => {
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test decreaseSupplierAllowance', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test getRoles', async () => {
		tr = await th.getRoles(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test dissociateToken', async () => {
		tr = await th.dissociateToken(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test associateToken', async () => {
		tr = await th.associateToken(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	afterEach(async () => {
		expect(tr).not.toBeNull();
		expect(tr.error).toEqual(undefined);
	});
});
