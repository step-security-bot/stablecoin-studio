import ModalAction from '../components/ModalAction';
import { Button, ChakraProvider, Flex, Link, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react';
import theme from '../theme/Theme';
import { useEffect, useState } from 'react';
import InputController from '../components/Form/InputController';
import { useForm } from 'react-hook-form';
import { CheckboxController } from '../components/Form/CheckboxController';

interface DisclaimerProps {
	setAccepted: (accepted: boolean) => void;
}

const Disclaimer = ({ setAccepted }: DisclaimerProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const  { control,  formState } = useForm({
		mode: 'onChange'
	});

	const [firstName, setFirstName] = useState<String>('');
	const [lastName, setLastName] = useState<String>('');
	const [email, setEmail] = useState<String>('');
	const [disclaimer, setDisclaimer] = useState<boolean>(false);

	useEffect(() => {
		onOpen();
	}, []);

	const handleSubmit = () => {
		fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/create', {
			method: 'POST',
			body: JSON.stringify({
				properties: {
					firstName,
					lastName,
					email,
					disclaimer,
					stablecoin_studio_signup: new Date().toISOString().slice(0, 10) + ""
				},
				associations: []
			}),
			headers: {
				"accept": "application/json",
				"content-type": "application/json",
				"authorization": "Bearer pat-na1-6cb24f23-c329-424e-b501-572dec0b654e"
			},
		});
	};

	return (
		<ChakraProvider theme={theme}>
			<Flex
				w='full'
				h='100vh'
				justify={'center'}
				alignSelf='center'
				alignContent={'center'}
				flex={1}
				flexDir='column'
				gap={10}
			>
				<>
					<Button
						data-testid='modal-term-conditions-button'
						onClick={() => {
							onOpen();
						}}
						variant='primary'
						alignSelf={'center'}
					>
						Terms & Conditions
					</Button>
					<ModalAction
						data-testid='disclaimer'
						title='Terms & Conditions'
						isOpen={isOpen}
						onClose={onClose}
						onConfirm={() => {
							handleSubmit();
							setAccepted(true);
						}}
						cancelButtonLabel='Cancel'
						confirmButtonLabel='Accept'
						isDisabled={!formState.isValid || !disclaimer}
					>
						<VStack h='full' justify={'space-between'} pt='10px' align={'left'}>
							<Stack as='form' spacing={4}>
								<InputController
									rules={{
										required: "This field is required",
										validate: {
											validation: (value: string) => {
												if (value === undefined || value.length > 20) {
													setFirstName('');
													return 'Invalid First Name';
												}
												setFirstName(value);
												return true;
											},
										},
									}}
									isRequired
									control={control}
									name='firstname'
									label='First Name'
									placeholder='First Name'
								/>
								<InputController
									rules={{
										required: "This field is required",
										validate: {
											validation: (value: string) => {
												if (value === undefined || value.length > 20) {
													setLastName('');
													return 'Invalid Last Name';
												}
												setLastName(value);
												return true;
											},
										},
									}}
									isRequired
									control={control}
									name='lastname'
									label='Last Name'
									placeholder='Last Name'
								/>
								<InputController
									rules={{
										required: "This field is required",
										validate: {
											validation: (value: string) => {
												if (value === undefined || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
													setEmail('');
													return 'Invalid Email';
												}
												setEmail(value);
												return true;
											},
										},
									}}
									isRequired
									control={control}
									name='email'
									label='Email'
									placeholder='Email'
								/>

								<Text
									fontSize='17px'
									color='brand.secondary'
									fontWeight={400}
									align='left'
									w='full'
									as='i'
								>
									<Link href={'https://swirldslabs.com/privacy-policy/'} isExternal>
										Privacy Policy
									</Link>
								</Text>
								<CheckboxController
									control={control}
									id='dsiclaimer'
									onChange={(e) => {
										setDisclaimer(e.target.checked);
									}}
								>
									<Text
										fontSize='14px'
										color='brand.secondary'
										fontWeight={400}
										align='left'
										w='full'
										as='i'
									>
										By clicking accept you agree to the Terms and Conditions.
									</Text>
								</CheckboxController>
							</Stack>
						</VStack>
					</ModalAction>
				</>
			</Flex>
		</ChakraProvider>
	);
};

export default Disclaimer;
