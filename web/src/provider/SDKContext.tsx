import type { SDK } from 'hedera-stable-coin-sdk';
import type { ReactNode } from 'react';
import { createContext, useState } from 'react';

// type WithNullableBooleanFields<T> = {
// 	[K in keyof T]: T[K] extends boolean ? T[K] | undefined : T[K];
// };

export type SDKService = SDK | undefined;

interface SDKContextProps {
	loading: boolean;
	setLoading: (state: boolean) => void;
	sdk: SDKService;
	setSDK: (sdk: SDKService) => void;
}

const init: SDKContextProps = {
	loading: false,
	setLoading: () => {},
	sdk: undefined,
	setSDK: () => {},
};

export const SDKContext = createContext<SDKContextProps>(init);

export const SDKContextProvider = ({ children }: { children: ReactNode }) => {
	const [sdk, setSDK] = useState<SDKService>(init.sdk);
	const [loading, setLoading] = useState<boolean>(init.loading);

	const value: SDKContextProps = {
		...init,
		loading,
		setLoading,
		sdk,
		setSDK,
	};

	return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};
