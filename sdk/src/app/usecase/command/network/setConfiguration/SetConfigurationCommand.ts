import { Command } from '../../../../../core/command/Command';
import { CommandResponse } from '../../../../../core/command/CommandResponse';
import ContractId from '../../../../../domain/context/contract/ContractId';

export class SetConfigurationCommandResponse implements CommandResponse {
	constructor(public readonly factoryAddress: string) {}
}

export class SetConfigurationCommand extends Command<SetConfigurationCommandResponse> {
	constructor(public readonly factoryAddress: string) {
		super();
	}
}
