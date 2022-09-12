import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';

describe('🧪 [DOMAIN] StableCoin', () => {

	const baseCoin: { name: string; symbol: string; decimals: number } = {
		name: 'TEST COIN',
		symbol: 'TEST COIN',
		decimals: 3,
	};

	it('Instantiate the class', () => {
		const coin = new StableCoin({
			name: baseCoin.name,
			symbol: baseCoin.symbol,
			decimals: baseCoin.decimals,
		});
		expect(coin).not.toBeNull();
	});

	it('Create an base instance', () => {
		const coin = new StableCoin({
			name: baseCoin.name,
			symbol: baseCoin.symbol,
			decimals: baseCoin.decimals,
		});
		expect(coin).not.toBeNull();
		expect(coin.name).toBe(baseCoin.name);
		expect(coin.symbol).toBe(baseCoin.symbol);
		expect(coin.decimals).toBe(baseCoin.decimals);
		expect(coin.initialSupply).toBe(0n);
		expect(coin.maxSupply).toBe(0n);
		expect(coin.memo).toBeUndefined();
		expect(coin.freezeKey).toBeUndefined();
		expect(coin.freezeDefault).toBe(false);
		expect(coin.kycKey).toBeUndefined();
		expect(coin.wipeKey).toBeUndefined();
		expect(coin.supplyKey).toBeUndefined();
		expect(coin.treasury).toBeUndefined();
		expect(coin.tokenType).toBe(TokenType.FUNGIBLE_COMMON);
		expect(coin.supplyType).toBe(TokenSupplyType.INFINITE);
	});

	it('Create an instance with all properties', () => {
		const coin = new StableCoin({
			name: baseCoin.name,
			symbol: baseCoin.symbol,
			decimals: baseCoin.decimals,
		});
		expect(coin).not.toBeNull();
		expect(coin.name).toBe(baseCoin.name);
		expect(coin.symbol).toBe(baseCoin.symbol);
		expect(coin.decimals).toBe(baseCoin.decimals);
	});

	it('Create an instance with valid decimals, check against invalid amount', () => {
		const coin = new StableCoin({
			name: baseCoin.name,
			symbol: baseCoin.symbol,
			decimals: baseCoin.decimals,
		});
		expect(coin).not.toBeNull();
		expect(coin.name).toBe(baseCoin.name);
		expect(coin.symbol).toBe(baseCoin.symbol);
		expect(coin.decimals).toBe(baseCoin.decimals);
		expect(coin.isValidAmount(100.4213214241232)).toBeFalsy();
		expect(coin.isValidAmount(100)).toBeTruthy();
		expect(coin.isValidAmount(100.42)).toBeTruthy();
		expect(coin.isValidAmount(100.1)).toBeTruthy();
	});
});
