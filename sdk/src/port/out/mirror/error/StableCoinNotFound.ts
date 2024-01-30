import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class StableCoinNotFound extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.NotFound, `${val} was not found`);
	}
}
