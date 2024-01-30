import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';
import { StableCoinRole } from '../../../../../../domain/context/stablecoin/StableCoinRole';

export class GrantRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantRoleCommand extends Command<GrantRoleCommandResponse> {
	constructor(
		public readonly role: StableCoinRole,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
