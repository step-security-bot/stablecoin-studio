import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class RevokeSupplierRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RevokeSupplierRoleCommand extends Command<RevokeSupplierRoleCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
