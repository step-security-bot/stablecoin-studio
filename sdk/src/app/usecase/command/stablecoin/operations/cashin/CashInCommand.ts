import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class CashInCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class CashInCommand extends Command<CashInCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
