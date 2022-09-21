/* eslint-disable no-debugger */
import { HederaNetwork, HederaNetworkEnviroment, NetworkMode, SDK } from 'hedera-stable-coin-sdk';
import { useEffect, useContext, useState } from 'react';
import type { SDKService } from './SDKContext';
import { SDKContext } from './SDKContext';
import type { AppMetadata } from 'hedera-stable-coin-sdk';

const appMetadata: AppMetadata = {
	name: 'dApp Example',
	description: 'An example hedera dApp',
	icon: 'https://absolute.url/to/icon.png',
	url: '',
};
export function useSDK(): SDKService {
	const { loading, setLoading, sdk, setSDK } = useContext(SDKContext); // TODO: it's a workaround to keep the hook output updated with context setData
	const [localSDK, setLocalSDK] = useState(sdk);

	async function setUpSDK() {
		const sdkInstance = new SDK({
			network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
			mode: NetworkMode.HASHPACK,
			options: {
				appMetadata,
			},
		});
		await sdkInstance.init();
		setSDK(sdkInstance);
		setLocalSDK(sdkInstance);
	}

	console.log('local sdk', localSDK);

	useEffect(() => {
		if (!loading) {
			setLoading(true);

			setUpSDK();

			// We musn't cancel this request
		}
	}, [loading]); //eslint-disable-line

	return localSDK;
}
