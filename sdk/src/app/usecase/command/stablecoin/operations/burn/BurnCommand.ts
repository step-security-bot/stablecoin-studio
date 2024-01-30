import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class BurnCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class BurnCommand extends Command<BurnCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
