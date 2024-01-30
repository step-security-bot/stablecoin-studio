import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class PrivateKeyTypeNotValid extends BaseError {
	constructor(val: string) {
		super(
			ErrorCode.PrivateKeyTypeInvalid,
			`Private Key Type ${val} is not a valid type`,
		);
	}
}
