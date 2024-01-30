import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class PauseCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class PauseCommand extends Command<PauseCommandResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
