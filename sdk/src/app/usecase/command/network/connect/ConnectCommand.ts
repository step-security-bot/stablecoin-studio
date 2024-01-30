import { Command } from '../../../../../core/command/Command';
import { CommandResponse } from '../../../../../core/command/CommandResponse';
import Account from '../../../../../domain/context/account/Account';
import { Environment } from '../../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import { InitializationData } from '../../../../../port/out/TransactionAdapter';
import DfnsSettings from 'domain/context/custodialwalletsettings/DfnsSettings';
import FireblocksSettings from 'domain/context/custodialwalletsettings/FireblocksSettings';

export class ConnectCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: InitializationData,
		public readonly walletType: SupportedWallets,
	) {}
}

export class ConnectCommand extends Command<ConnectCommandResponse> {
	constructor(
		public readonly environment: Environment,
		public readonly wallet: SupportedWallets,
		public readonly account?: Account,
		public readonly custodialSettings?: DfnsSettings | FireblocksSettings,
	) {
		super();
	}
}
