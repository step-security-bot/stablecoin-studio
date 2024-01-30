import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class MaxSupplyReached extends BaseError {
	constructor(maxSupply: string) {
		super(ErrorCode.MaxSupplyReached, `max supply ${maxSupply} reached`);
	}
}
