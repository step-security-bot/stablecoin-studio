import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';import Validation from './validation/Validation.js';
import { StableCoinRole } from '../sdk.js';

export default class RevokeRoleRequest
	extends ValidatedRequest<RevokeRoleRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
	tokenId: string;
	role: StableCoinRole;

	constructor({
		account,
		targetId,
		proxyContractId,
		tokenId,
		role
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
		tokenId: string;
		role: StableCoinRole;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole()	
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.role = role;
	}
}
