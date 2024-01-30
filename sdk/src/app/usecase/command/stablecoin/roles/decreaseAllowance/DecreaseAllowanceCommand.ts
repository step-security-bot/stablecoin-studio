import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class DecreaseAllowanceCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class DecreaseAllowanceCommand extends Command<DecreaseAllowanceCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
