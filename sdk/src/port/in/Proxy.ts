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

import Injectable from '../../core/Injectable';
import { CommandBus } from '../../core/command/CommandBus';
import { handleValidation } from './Common';
import { QueryBus } from '../../core/query/QueryBus';
import { LogError } from '../../core/decorator/LogErrorDecorator';
import GetProxyConfigRequest from './request/GetProxyConfigRequest';
import UpgradeImplementationRequest from './request/UpgradeImplementationRequest';
import { GetProxyConfigQuery } from '../../app/usecase/query/proxy/GetProxyConfigQuery';
import { HederaId } from '../../domain/context/shared/HederaId';
import { UpgradeImplementationCommand } from '../../app/usecase/command/proxy/upgrade/UpgradeImplementationCommand';
import ContractId from '../../domain/context/contract/ContractId';
import { ChangeOwnerCommand } from '../../app/usecase/command/proxy/changeOwner/ChangeOwnerCommand';
import { AcceptOwnerCommand } from '../../app/usecase/command/proxy/acceptOwner/AcceptOwnerCommand';
import ProxyConfigurationViewModel from '../out/rpc/response/ProxyConfigurationViewModel';
import ChangeProxyOwnerRequest from './request/ChangeProxyOwnerRequest';
import { MirrorNodeAdapter } from "../out/mirror/MirrorNodeAdapter";
import AcceptProxyOwnerRequest from './request/AcceptProxyOwnerRequest';
import GetFactoryProxyConfigRequest from './request/GetFactoryProxyConfigRequest';
import { GetFactoryProxyConfigQuery } from '../../app/usecase/query/factoryProxy/GetFactoryProxyConfigQuery';
import UpgradeFactoryImplementationRequest from './request/UpgradeFactoryImplementationRequest';
import { UpgradeFactoryImplementationCommand } from '../../app/usecase/command/factoryProxy/upgrade/UpgradeFactoryImplementationCommand';
import ChangeFactoryProxyOwnerRequest from './request/ChangeFactoryProxyOwnerRequest';
import AcceptFactoryProxyOwnerRequest from './request/AcceptFactoryProxyOwnerRequest';
import { ChangeFactoryOwnerCommand } from '../../app/usecase/command/factoryProxy/changeOwner/ChangeFactoryOwnerCommand';
import { AcceptFactoryOwnerCommand } from '../../app/usecase/command/factoryProxy/acceptOwner/AcceptFactoryOwnerCommand';

export { ProxyConfigurationViewModel };

interface IProxyInPort {
	getProxyConfig(
		request: GetProxyConfigRequest,
	): Promise<ProxyConfigurationViewModel>;
	getFactoryProxyConfig(
		request: GetFactoryProxyConfigRequest,
	): Promise<ProxyConfigurationViewModel>;
	changeProxyOwner(request: ChangeProxyOwnerRequest): Promise<boolean>;
	acceptProxyOwner(request: AcceptProxyOwnerRequest): Promise<boolean>;
	upgradeImplementation(
		request: UpgradeImplementationRequest,
	): Promise<boolean>;
	changeFactoryProxyOwner(
		request: ChangeFactoryProxyOwnerRequest,
	): Promise<boolean>;
	acceptFactoryProxyOwner(
		request: AcceptFactoryProxyOwnerRequest,
	): Promise<boolean>;
	upgradeFactoryImplementation(
		request: UpgradeFactoryImplementationRequest,
	): Promise<boolean>;
}

class ProxyInPort implements IProxyInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	@LogError
	async getProxyConfig(
		request: GetProxyConfigRequest,
	): Promise<ProxyConfigurationViewModel> {
		handleValidation('GetProxyConfigRequest', request);
		const res = await this.queryBus.execute(
			new GetProxyConfigQuery(HederaId.from(request.tokenId)),
		);
		return res.payload;
	}

	@LogError
	async getFactoryProxyConfig(
		request: GetFactoryProxyConfigRequest,
	): Promise<ProxyConfigurationViewModel> {
		handleValidation('GetFactoryProxyConfigRequest', request);
		const res = await this.queryBus.execute(
			new GetFactoryProxyConfigQuery(HederaId.from(request.factoryId)),
		);
		return res.payload;
	}

	@LogError
	async changeProxyOwner(request: ChangeProxyOwnerRequest): Promise<boolean> {
		handleValidation('ChangeProxyOwnerRequest', request);
		const res = await this.commandBus.execute(
			new ChangeOwnerCommand(
				HederaId.from(request.tokenId),
				HederaId.from(request.targetId),
			),
		);
		return res.payload;
	}

	@LogError
	async acceptProxyOwner(request: AcceptProxyOwnerRequest): Promise<boolean> {
		handleValidation('AcceptProxyOwnerRequest', request);
		const res = await this.commandBus.execute(
			new AcceptOwnerCommand(HederaId.from(request.tokenId)),
		);
		return res.payload;
	}

	@LogError
	async upgradeImplementation(
		request: UpgradeImplementationRequest,
	): Promise<boolean> {
		handleValidation('UpgradeImplementationRequest', request);
		const proxyId: string = (
			await this.mirrorNode.getContractInfo(request.implementationAddress)
		).id;

		const res = await this.commandBus.execute(
			new UpgradeImplementationCommand(
				HederaId.from(request.tokenId),
				new ContractId(proxyId),
			),
		);
		return res.payload;
	}

	@LogError
	async upgradeFactoryImplementation(
		request: UpgradeFactoryImplementationRequest,
	): Promise<boolean> {
		handleValidation('UpgradeFactoryImplementationRequest', request);
		const res = await this.commandBus.execute(
			new UpgradeFactoryImplementationCommand(
				HederaId.from(request.factoryId),
				new ContractId(request.implementationAddress),
			),
		);
		return res.payload;
	}

	@LogError
	async changeFactoryProxyOwner(
		request: ChangeFactoryProxyOwnerRequest,
	): Promise<boolean> {
		handleValidation('ChangeFactoryProxyOwnerRequest', request);
		const res = await this.commandBus.execute(
			new ChangeFactoryOwnerCommand(
				HederaId.from(request.factoryId),
				HederaId.from(request.targetId),
			),
		);
		return res.payload;
	}

	@LogError
	async acceptFactoryProxyOwner(
		request: AcceptFactoryProxyOwnerRequest,
	): Promise<boolean> {
		handleValidation('AcceptFactoryProxyOwnerRequest', request);
		const res = await this.commandBus.execute(
			new AcceptFactoryOwnerCommand(HederaId.from(request.factoryId)),
		);
		return res.payload;
	}
}

const Proxy = new ProxyInPort();
export default Proxy;
