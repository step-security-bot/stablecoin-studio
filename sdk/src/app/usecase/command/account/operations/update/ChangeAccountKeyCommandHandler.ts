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

import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import {
	ChangeAccountKeyCommand,
	ChangeAccountKeyCommandResponse,
} from './ChangeAccountKeyCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';

@CommandHandler(ChangeAccountKeyCommand)
export class ChangeAccountKeyCommandHandler
	implements ICommandHandler<ChangeAccountKeyCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: ChangeAccountKeyCommand,
	): Promise<ChangeAccountKeyCommandResponse> {
		const { targetId, newKey, newPrivateKey } = command;
		const handler = this.transactionService.getHandler();

		const res = await handler.changeAccountKey(
			targetId,
			newKey,
			newPrivateKey,
		);
		return Promise.resolve(
			new ChangeAccountKeyCommandResponse(res.error === undefined),
		);
	}
}
