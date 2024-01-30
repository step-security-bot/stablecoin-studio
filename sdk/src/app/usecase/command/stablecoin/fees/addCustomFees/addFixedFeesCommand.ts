import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class addFixedFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class addFixedFeesCommand extends Command<addFixedFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly collectorId: HederaId,
		public readonly tokenIdCollected: HederaId,
		public readonly amount: BigDecimal,
		public readonly collectorsExempt: boolean,
	) {
		super();
	}
}
