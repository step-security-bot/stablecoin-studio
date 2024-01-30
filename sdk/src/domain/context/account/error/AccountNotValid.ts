import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class AccountNotValid extends BaseError {
	constructor(cause: string) {
		super(ErrorCode.InvalidAmount, `Account is not valid: ${cause}`);
	}
}
