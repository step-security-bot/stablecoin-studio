/* eslint-disable @typescript-eslint/no-unused-vars */
import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ModalHashpack from '../components/ModalHashpack';
import { useSDK } from '../provider/useSDK';
// import SDKService from '../services/SDKService';

const Login = () => {
	const [availabilityExtension, setAvailabilityExtension] = useState<boolean | undefined>();
	const sdk = useSDK();

	useEffect(() => {
		getAvailability();
	}, [sdk]);

	const getAvailability = async () => {
		const availability = await sdk?.getAvailabilityExtension();
		console.log('av', availability, sdk);
		setAvailabilityExtension(availability);
	};

	return (
		<Flex
			alignItems='center'
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
			{!availabilityExtension ? (
				<ModalHashpack type='no-installed' />
			) : (
				<ModalHashpack type='no-connected' />
			)}
		</Flex>
	);
};

export default Login;
