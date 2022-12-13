import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CheckSupplierLimitRequest
	extends ValidatedRequest<CheckSupplierLimitRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;

    @OptionalField()
	supplierType?: string;

	constructor({
		account,
		targetId,
		proxyContractId,
		supplierType,
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
		supplierType?: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkHederaIdFormat(),
			supplierType: CheckSupplierLimitRequest.checkSupplierType()
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.targetId = targetId;
		this.supplierType = supplierType;
	}

	private static checkSupplierType = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const supplierTypes: string[] = ['limited', 'unlimited'];
			if (!supplierTypes.includes(val)) {
				err.push(new InvalidSupplierType(val));
			}
			return err;
		};
	};
}
