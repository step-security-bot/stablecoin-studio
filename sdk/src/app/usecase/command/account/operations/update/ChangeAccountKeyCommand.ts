import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import PrivateKey from '../../../../../../domain/context/account/PrivateKey.js';
import PublicKey from '../../../../../../domain/context/account/PublicKey.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class ChangeAccountKeyCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ChangeAccountKeyCommand extends Command<ChangeAccountKeyCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly newKey: PublicKey,
		public readonly newPrivateKey: PrivateKey,
	) {
		super();
	}
}
