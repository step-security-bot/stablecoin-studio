import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Input,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Text,
	VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

export interface DfnsFormValues {
	serviceAccountSecretKey: string;
	serviceAccountCredentialId: string;
	serviceAccountAuthToken: string;
	appOrigin: string;
	appId: string;
	baseUrl: string;
	walletId: string;
	hederaAccountId: string;
}

interface DfnsFormRawValues extends Omit<DfnsFormValues, 'serviceAccountSecretKey'> {
	serviceAccountSecretKeyFileInput: FileList;
}

interface DfnsFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (data: DfnsFormValues) => void;
}

const DfnsFormModal = (props: DfnsFormModalProps) => {
	const { isOpen, onClose, onConfirm } = props;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<DfnsFormRawValues>();

	const onSubmit: SubmitHandler<DfnsFormRawValues> = (data) => {
		try {
			const { serviceAccountSecretKeyFileInput, ...commonData } = data;
			const fileInput = serviceAccountSecretKeyFileInput[0];

			if (fileInput) {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target) {
						const fileContent = e.target.result as string;
						onConfirm({ ...commonData, serviceAccountSecretKey: fileContent });
					}
				};
				reader.onerror = (e) => {
					console.error('Error reading file:', e.target?.error);
				};
				reader.readAsText(fileInput);
			} else {
				console.error('No file selected');
			}
		} catch (error) {
			console.error('Error reading file:', error);
		}
	};

	return (
		<>
			<ModalHeader>
				<Text fontSize='19px' fontWeight={700} lineHeight='16px' color='brand.black'>
					Dfns settings
				</Text>
			</ModalHeader>
			<ModalBody textAlign='center' pt='14px'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<HStack spacing={8}>
						<VStack spacing={4} flex={1}>
							<FormControl isInvalid={!!errors.serviceAccountCredentialId}>
								<FormLabel htmlFor='serviceAccountCredentialId'>
									Service Account Credential ID
								</FormLabel>
								<Input
									id='serviceAccountCredentialId'
									{...register('serviceAccountCredentialId', { required: true })}
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.serviceAccountAuthToken}>
								<FormLabel htmlFor='serviceAccountAuthToken'>Service Account Auth Token</FormLabel>
								<Input
									id='serviceAccountAuthToken'
									{...register('serviceAccountAuthToken', { required: true })}
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.appOrigin}>
								<FormLabel htmlFor='appOrigin'>App Origin</FormLabel>
								<Input
									id='appOrigin'
									{...register('appOrigin', { required: true })}
									defaultValue='http://stablecoin.es'
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.appId}>
								<FormLabel htmlFor='appId'>App ID</FormLabel>
								<Input id='appId' {...register('appId', { required: true })} />
							</FormControl>
						</VStack>
						<VStack spacing={4} flex={1}>
							<FormControl isInvalid={!!errors.baseUrl}>
								<FormLabel htmlFor='baseUrl'>Base URL</FormLabel>
								<Input
									id='baseUrl'
									{...register('baseUrl', { required: true })}
									defaultValue='https://api.dfns.ninja'
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.walletId}>
								<FormLabel htmlFor='walletId'>Wallet ID</FormLabel>
								<Input id='walletId' {...register('walletId', { required: true })} />
							</FormControl>
							<FormControl isInvalid={!!errors.hederaAccountId}>
								<FormLabel htmlFor='hederaAccountId'>Hedera Account ID</FormLabel>
								<Input id='hederaAccountId' {...register('hederaAccountId', { required: true })} />
							</FormControl>
						</VStack>
					</HStack>
					<FormControl isInvalid={!!errors.serviceAccountSecretKeyFileInput}>
						<FormLabel paddingTop={3} htmlFor='serviceAccountSecretKeyFileInput'>
							SecretKey (File with extension &quot;.key&quot;)
						</FormLabel>
						<Input
							padding={1.5}
							id='serviceAccountSecretKeyFileInput'
							type='file'
							{...register('serviceAccountSecretKeyFileInput', { required: true })}
						/>
						{errors.serviceAccountSecretKeyFileInput && (
							<FormErrorMessage>.key is mandatory</FormErrorMessage>
						)}
					</FormControl>
					<ModalFooter justifyContent='center' pt={4}>
						<HStack spacing={6} w='full'>
							<Button onClick={onClose} variant='secondary' flex={1}>
								Cancel
							</Button>
							<Button type='submit' flex={1}>
								Confirm
							</Button>
						</HStack>
					</ModalFooter>
				</form>
			</ModalBody>
		</>
	);
};

export default DfnsFormModal;
