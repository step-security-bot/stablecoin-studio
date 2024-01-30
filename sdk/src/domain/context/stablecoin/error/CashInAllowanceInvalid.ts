import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class CashInAllowanceInvalid extends BaseError {
	constructor(cashInAllowance: string) {
		super(
			ErrorCode.InvalidRange,
			`Cash in allowance ${cashInAllowance} is not within 0 and MAX_SUPPLY`,
		);
	}
}
