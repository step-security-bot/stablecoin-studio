import { Command } from '../../../../../core/command/Command';
import { CommandResponse } from '../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../domain/context/shared/HederaId';

export class AssociateCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class AssociateCommand extends Command<AssociateCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
