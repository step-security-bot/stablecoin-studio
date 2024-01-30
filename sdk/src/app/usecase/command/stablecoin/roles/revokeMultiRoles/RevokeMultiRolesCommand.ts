import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';
import { StableCoinRole } from '../../../../../../domain/context/stablecoin/StableCoinRole';

export class RevokeMultiRolesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RevokeMultiRolesCommand extends Command<RevokeMultiRolesCommandResponse> {
	constructor(
		public readonly roles: StableCoinRole[],
		public readonly targetsId: HederaId[],
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
