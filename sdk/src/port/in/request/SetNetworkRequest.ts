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

import { Environment } from '../../../domain/context/network/Environment';
import { MirrorNode } from '../../../domain/context/network/MirrorNode';
import { JsonRpcRelay } from '../../../domain/context/network/JsonRpcRelay';
import ValidatedRequest from './validation/ValidatedRequest';
import Validation from './validation/Validation';

export interface SetNetworkRequestProps {
	environment: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	consensusNodes?: string;
}

export default class SetNetworkRequest extends ValidatedRequest<SetNetworkRequest> {
	environment: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	consensusNodes?: string;
	constructor(props: SetNetworkRequestProps) {
		super({
			environment: Validation.checkString({ emptyCheck: true }),
		});
		Object.assign(this, props);
	}
}
