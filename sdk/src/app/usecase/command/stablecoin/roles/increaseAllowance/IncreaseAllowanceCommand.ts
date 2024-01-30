import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class IncreaseAllowanceCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class IncreaseAllowanceCommand extends Command<IncreaseAllowanceCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
