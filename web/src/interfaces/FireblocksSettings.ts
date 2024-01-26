import type { FireblocksFormValues } from '../components/Form/FireblocksFormModal';

export class FireblocksSettings {
	public secretKey: string;
	public apiKey: string;
	public baseUrl: string;
	public assetId: string;
	public vaultAccountId: string;
	public hederaAccountId: string;
	public hederaAccountPublicKey: string;

	constructor(
		secretKey: string,
		apiKey: string,
		baseUrl: string,
		assetId: string,
		vaultAccountId: string,
		hederaAccountId: string,
		hederaAccountPublicKey: string,
	) {
		this.secretKey = secretKey;
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.assetId = assetId;
		this.vaultAccountId = vaultAccountId;
		this.hederaAccountId = hederaAccountId;
		this.hederaAccountPublicKey = hederaAccountPublicKey;
	}

	static fromForm(form: FireblocksFormValues) {
		return new FireblocksSettings(
			form.secretKey,
			form.apiKey,
			form.baseUrl,
			form.assetId,
			form.vaultAccountId,
			form.hederaAccountId,
			form.hederaAccountPublicKey,
		);
	}
}
