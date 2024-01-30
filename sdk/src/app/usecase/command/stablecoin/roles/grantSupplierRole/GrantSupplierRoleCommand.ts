import { Command } from '../../../../../../core/command/Command';
import { CommandResponse } from '../../../../../../core/command/CommandResponse';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal';
import { HederaId } from '../../../../../../domain/context/shared/HederaId';

export class GrantSupplierRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantSupplierRoleCommand extends Command<GrantSupplierRoleCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
		public readonly amount: string,
	) {
		super();
	}
}
