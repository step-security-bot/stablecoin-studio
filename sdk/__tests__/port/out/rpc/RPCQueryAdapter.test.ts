/*
 *
 * Hedera Stable Coin SDK
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

import { BigNumber } from 'ethers';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts';
import { BalanceOfQuery } from '../../../../src/app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import Injectable from '../../../../src/core/Injectable.js';
import { QueryBus } from '../../../../src/core/query/QueryBus.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import { Network, SetNetworkRequest } from '../../../../src/index.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';

describe('🧪 RPCQueryAdapter', () => {
	const bus = Injectable.resolve(QueryBus);
	const adapter = Injectable.resolve(RPCQueryAdapter);

	beforeAll(async () => {
		await Network.setNetwork(
			new SetNetworkRequest({
				environment: 'testnet',
			}),
		);
	});

	beforeEach(async() => {
		await adapter.init();
	})

	it('Test it initializes', async () => {
		const env = await adapter.init('testUrl');

		expect(env).toEqual('testnet');
		expect(adapter.provider).toBeDefined();
		expect(adapter.provider.connection.url).toEqual('testUrl');
	});

	it('Test it fetches a balance', async () => {
		const res = await bus.execute(
			new BalanceOfQuery(
				HederaId.from('0.0.49332748'),
				HederaId.from('0.0.49142551'),
			),
		);
		console.log('RES', res);
		expect(res).not.toBeUndefined();
	});
});
