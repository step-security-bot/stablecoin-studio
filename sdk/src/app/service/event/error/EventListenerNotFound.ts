import BaseError, { ErrorCode } from '../../../../core/error/BaseError';

export class EventListenerNotFound extends BaseError {
	constructor(name: string) {
		super(
			ErrorCode.RuntimeError,
			`Event (${name}) emitter listener not registered yet`,
		);
	}
}
