import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class ContractNotFound extends BaseError {
	constructor(contractId: string) {
		super(ErrorCode.ContractNotFound, `Contract ${contractId} not found`);
	}
}
