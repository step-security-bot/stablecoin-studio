import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class UnPauseCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UnPauseCommand extends Command<UnPauseCommandResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
