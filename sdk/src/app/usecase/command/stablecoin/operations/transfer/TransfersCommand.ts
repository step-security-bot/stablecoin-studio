import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class TransfersCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class TransfersCommand extends Command<TransfersCommandResponse> {
	constructor(
		public readonly amounts: string[],
		public readonly targetsIds: HederaId[],
		public readonly tokenId: HederaId,
		public readonly targetId: HederaId,
	) {
		super();
	}
}
