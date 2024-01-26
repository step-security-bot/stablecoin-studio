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

export interface FireblocksFormValues {
	secretKey: string;
	apiKey: string;
	baseUrl: string;
	assetId: string;
	vaultAccountId: string;
	hederaAccountId: string;
}

interface FireblocksFormRawValues extends Omit<FireblocksFormValues, 'secretKey'> {
	secretKeyFileInput: FileList;
}

interface FireblocksFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (data: FireblocksFormValues) => void;
}

const FireblocksFormModal = (props: FireblocksFormModalProps) => {
	const { isOpen, onClose, onConfirm } = props;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FireblocksFormRawValues>();

	const onSubmit: SubmitHandler<FireblocksFormRawValues> = (data) => {
		try {
			const { secretKeyFileInput, ...commonData } = data;
			const fileInput = secretKeyFileInput[0];

			if (fileInput) {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target) {
						const fileContent = e.target.result as string;
						onConfirm({ ...commonData, secretKey: fileContent });
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
					Fireblocks settings
				</Text>
			</ModalHeader>
			<ModalBody textAlign='center' pt='14px'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<VStack spacing={4}>
						<FormControl isInvalid={!!errors.apiKey}>
							<FormLabel htmlFor='apiKey'>API Key</FormLabel>
							<Input id='apiKey' {...register('apiKey', { required: true })} />
						</FormControl>
						<FormControl isInvalid={!!errors.baseUrl}>
							<FormLabel htmlFor='baseUrl'>Base URL</FormLabel>
							<Input
								id='baseUrl'
								{...register('baseUrl', { required: true })}
								defaultValue='https://api.fireblocks.io'
							/>
						</FormControl>
						<FormControl isInvalid={!!errors.assetId}>
							<FormLabel htmlFor='assetId'>Asset ID</FormLabel>
							<Input id='assetId' {...register('assetId', { required: true })} />
						</FormControl>
						<FormControl isInvalid={!!errors.vaultAccountId}>
							<FormLabel htmlFor='vaultAccountId'>Vault Account ID</FormLabel>
							<Input id='vaultAccountId' {...register('vaultAccountId', { required: true })} />
						</FormControl>
						<FormControl isInvalid={!!errors.hederaAccountId}>
							<FormLabel htmlFor='hederaAccountId'>Hedera Account ID</FormLabel>
							<Input id='hederaAccountId' {...register('hederaAccountId', { required: true })} />
						</FormControl>
						<FormControl isInvalid={!!errors.secretKeyFileInput}>
							<FormLabel htmlFor='secretKeyFileInput'>
								SecretKey (File with extension &quot;.key&quot;)
							</FormLabel>
							<Input
								padding={1.5}
								id='secretKeyFileInput'
								type='file'
								{...register('secretKeyFileInput', { required: true })}
							/>
							{errors.secretKeyFileInput && <FormErrorMessage>.key is mandatory</FormErrorMessage>}
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
		</>
	);
};

export default FireblocksFormModal;
