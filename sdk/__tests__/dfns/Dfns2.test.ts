/*
 *
 * Hedera Stablecoin SDK
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

import { ethers } from 'ethers';
import { HederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts';

const url = 'http://127.0.0.1:7546';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

const transaction: ethers.ContractTransaction =
	await HederaTokenManager__factory.connect('0x', customHttpProvider);
console.log('transaction: ' + transaction);
