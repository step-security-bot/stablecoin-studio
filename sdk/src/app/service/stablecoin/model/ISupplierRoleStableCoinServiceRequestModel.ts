import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel,
		ITargetIdRequestModel {}
