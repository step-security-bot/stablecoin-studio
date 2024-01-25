import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

export interface DfnsFormValues {
	serviceAccountSecretKeyFileInput: string;
	serviceAccountCredentialId: string;
	serviceAccountAuthToken: string;
	appOrigin: string;
	appId: string;
	baseUrl: string;
	walletId: string;
	hederaAccountId: string;
	hederaAccountPublicKey: string;
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
	} = useForm<DfnsFormValues>();

	const onSubmit: SubmitHandler<DfnsFormValues> = (data, event) => {
		const fileInput = event?.target[3].files[0];

		if (fileInput) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target) {
					const fileContent = e.target.result as string;
					onConfirm({ ...data, serviceAccountSecretKeyFileInput: fileContent });
				}
			};
			reader.readAsText(fileInput);
		} else {
			console.error('Archivo no seleccionado');
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={'xl'}
			isCentered
			closeOnEsc={false}
			closeOnOverlayClick={false}
		>
			<ModalOverlay />
			<ModalContent p='50' w='500px'>
				<ModalCloseButton />
				<ModalHeader>
					<Text fontSize='19px' fontWeight={700} lineHeight='16px' color='brand.black'>
						Dfns settings
					</Text>
				</ModalHeader>
				<ModalBody textAlign='center' pt='14px'>
					<form onSubmit={handleSubmit(onSubmit)}>
						<VStack spacing={4}>
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
								<Input id='appOrigin' {...register('appOrigin', { required: true })} />
							</FormControl>
							<FormControl isInvalid={!!errors.appId}>
								<FormLabel htmlFor='appId'>App ID</FormLabel>
								<Input id='appId' {...register('appId', { required: true })} />
							</FormControl>
							<FormControl isInvalid={!!errors.baseUrl}>
								<FormLabel htmlFor='baseUrl'>Base URL</FormLabel>
								<Input
									id='baseUrl'
									{...register('baseUrl', { required: true })}
									defaultValue='https://api.Dfns.io'
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
							<FormControl isInvalid={!!errors.hederaAccountPublicKey}>
								<FormLabel htmlFor='hederaAccountPublicKey'>
									Hedera Account Public Key(format)
								</FormLabel>
								<Input
									id='hederaAccountPublicKey'
									{...register('hederaAccountPublicKey', { required: true })}
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.serviceAccountSecretKeyFileInput}>
								<FormLabel htmlFor='serviceAccountSecretKeyFileInput'>
									SecretKey (File with extension &quot;.key&quot;)
								</FormLabel>
								<Input
									id='serviceAccountSecretKeyFileInput'
									type='file'
									{...register('serviceAccountSecretKeyFileInput', { required: true })}
								/>
								{errors.serviceAccountSecretKeyFileInput && (
									<FormErrorMessage>.key is mandatory</FormErrorMessage>
								)}
							</FormControl>
						</VStack>
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
			</ModalContent>
		</Modal>
	);
};

export default DfnsFormModal;
