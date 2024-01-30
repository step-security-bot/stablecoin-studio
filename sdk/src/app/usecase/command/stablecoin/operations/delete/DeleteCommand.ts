import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class DeleteCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class DeleteCommand extends Command<DeleteCommandResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
