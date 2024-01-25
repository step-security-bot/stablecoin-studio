import type { DfnsFormValues } from '../components/Form/DfnsFormModal';

export class DfnsSettings {
	public serviceAccountSecretKey: string;
	public serviceAccountCredentialId: string;
	public serviceAccountAuthToken: string;
	public appOrigin: string;
	public appId: string;
	public baseUrl: string;
	public walletId: string;
	public hederaAccountId: string;
	public hederaAccountPublicKey: string;

	constructor(
		serviceAccountSecretKey: string,
		serviceAccountCredentialId: string,
		serviceAccountAuthToken: string,
		appOrigin: string,
		appId: string,
		baseUrl: string,
		walletId: string,
		hederaAccountId: string,
		hederaAccountPublicKey: string,
	) {
		this.serviceAccountSecretKey = serviceAccountSecretKey;
		this.serviceAccountCredentialId = serviceAccountCredentialId;
		this.serviceAccountAuthToken = serviceAccountAuthToken;
		this.appOrigin = appOrigin;
		this.appId = appId;
		this.baseUrl = baseUrl;
		this.walletId = walletId;
		this.hederaAccountId = hederaAccountId;
		this.hederaAccountPublicKey = hederaAccountPublicKey;
	}

	static fromForm(form: DfnsFormValues) {
		return new DfnsSettings(
			form.serviceAccountSecretKey,
			form.serviceAccountCredentialId,
			form.serviceAccountAuthToken,
			form.appOrigin,
			form.appId,
			form.baseUrl,
			form.walletId,
			form.hederaAccountId,
			form.hederaAccountPublicKey,
		);
	}
}
