import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { CustomFee } from '../../../../../../domain/context/fee/CustomFee';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class UpdateCustomFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UpdateCustomFeesCommand extends Command<UpdateCustomFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly customFees: CustomFee[],
	) {
		super();
	}
}
