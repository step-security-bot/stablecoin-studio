import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class addFractionalFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class addFractionalFeesCommand extends Command<addFractionalFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly collectorId: HederaId,
		public readonly amountNumerator: number,
		public readonly amountDenominator: number,
		public readonly min: BigDecimal,
		public readonly max: BigDecimal,
		public readonly net: boolean,
		public readonly collectorsExempt: boolean,
	) {
		super();
	}
}
