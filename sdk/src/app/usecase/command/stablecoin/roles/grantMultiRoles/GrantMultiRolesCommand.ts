import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';
import { StableCoinRole } from '../../../../../../domain/context/stablecoin/StableCoinRole';

export class GrantMultiRolesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantMultiRolesCommand extends Command<GrantMultiRolesCommandResponse> {
	constructor(
		public readonly roles: StableCoinRole[],
		public readonly targetsId: HederaId[],
		public readonly amounts: string[],
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
