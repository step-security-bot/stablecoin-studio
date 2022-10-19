import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITokenIdRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface ICashOutStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAmountRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel {
	publicKey?: PublicKey;
}
