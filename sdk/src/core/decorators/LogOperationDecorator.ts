import 'reflect-metadata';
import LogService from '../../app/service/log/LogService.js';
import { performance } from 'perf_hooks';

export const LogOperation = (
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
): PropertyDescriptor => {
	const originalMethod = descriptor.value;
	descriptor.value = function (...args: unknown[]): unknown {
		LogService.logTrace(`Method called: ${propertyKey}`);
		LogService.logTrace('Args: ', args);
		const start = performance.now();
		const result = originalMethod.apply(this, args);
		const finish = performance.now();
		LogService.logTrace(`Execution time [${propertyKey}]: ${finish - start} milliseconds`);
		return result;
	};

	return descriptor;
};