import {
	Button,
	HStack,
	Image,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Text,
	Tooltip,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import {
	GetFactoryProxyConfigRequest,
	SupportedWallets,
	Network,
} from '@hashgraph/stablecoin-npm-sdk';
import type { StableCoinListViewModel } from '@hashgraph/stablecoin-npm-sdk';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BLADE_LOGO_PNG from '../assets/png/bladeLogo.png';
import HASHPACK_LOGO_PNG from '../assets/png/hashpackLogo.png';
import FIREBLOCKS_LOGO_PNG from '../assets/png/fireblocksLogo.png';
import DFNS_LOGO_PNG from '../assets/png/dfnsLogo.png';
import METAMASK_LOGO from '../assets/svg/MetaMask_Fox.svg';
import SDKService from '../services/SDKService';
import {
	AVAILABLE_WALLETS,
	SELECTED_MIRRORS,
	SELECTED_RPCS,
	walletActions,
} from '../store/slices/walletSlice';
import WARNING_ICON from '../assets/svg/warning.svg';
import ERROR_ICON from '../assets/svg/error.svg';
import { SelectController } from './Form/SelectController';
import { useForm } from 'react-hook-form';
import type { IMirrorRPCNode } from '../interfaces/IMirrorRPCNode';
import type { FireblocksFormValues } from './Form/FireblocksFormModal';
import FireblocksFormModal from './Form/FireblocksFormModal';
import type { CustodialSettings } from '../interfaces/ICustodialSettings';
import { FireblocksSettings } from '../interfaces/FireblocksSettings';
import DfnsFormModal from './Form/DfnsFormModal';
import type { DfnsFormValues } from './Form/DfnsFormModal';
import { DfnsSettings } from '../interfaces/DfnsSettings';

const ModalWalletConnect = () => {
	const { t } = useTranslation('global');
	const dispatch = useDispatch();

	const {
		// isOpen: isWalletSelectOpen,
		// onOpen: onWalletSelectOpen,
		onClose: onWalletSelectClose,
	} = useDisclosure({ defaultIsOpen: true });

	const {
		isOpen: isFireblocksFormOpen,
		onOpen: onFireblocksFormOpen,
		onClose: onFireblocksFormClose,
	} = useDisclosure();

	const {
		isOpen: isDfnsFormOpen,
		onOpen: onDfnsFormOpen,
		onClose: onDfnsFormClose,
	} = useDisclosure();

	const styles = {
		providerStyle: {
			boxShadow: '0 0 12px 2px #E0E0E0',
			borderRadius: 10,
			p: 6,
			_hover: {
				cursor: 'pointer',
				boxShadow: '0 0 12px 6px #E0E0E0',
				transform: 'scale(1.05)',
			},
		},
		walletGroup: {
			boxShadow: '0 0 12px 2px #E0E0E0',
			borderRadius: 10,
			// borderWidth: 4,
			// borderColor: 'brand.black',
			p: 6,
			_hover: {
				cursor: 'pointer',
				// transform: 'scale(1.05)',
			},
		},
		networkOptions: {
			menuList: {
				maxH: '220px',
				overflowY: 'auto',
				bg: 'brand.white',
				boxShadow: 'down-black',
				p: 4,
			},
			wrapper: {
				border: '1px',
				borderColor: 'brand.black',
				borderRadius: '8px',
				height: 'initial',
			},
		},
	};

	const [loading, setLoading] = useState<SupportedWallets | undefined>(undefined);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [error, setError] = useState<any>();
	const [rejected, setRejected] = useState<boolean>(false);
	const [hashpackSelected, setHashpackSelected] = useState<boolean>(false);
	const [bladeSelected, setBladeSelected] = useState<boolean>(false);
	const availableWallets = useSelector(AVAILABLE_WALLETS);
	const selectedMirrors: IMirrorRPCNode[] = useSelector(SELECTED_MIRRORS);
	const selectedRPCs: IMirrorRPCNode[] = useSelector(SELECTED_RPCS);

	const { control, getValues } = useForm({
		mode: 'onChange',
	});

	const handleWalletConnect = async (
		wallet: SupportedWallets,
		network: string,
		custodialSettings?: CustodialSettings,
	) => {
		if (loading) return;
		setLoading(wallet);
		dispatch(walletActions.setLastWallet(wallet));
		dispatch(walletActions.setNetwork(network));
		dispatch(walletActions.setSelectedStableCoin(undefined));
		dispatch(walletActions.setSelectedStableCoinProxyConfig(undefined));
		dispatch(walletActions.setSelectedNetworkFactoryProxyConfig(undefined));
		dispatch(walletActions.setIsProxyOwner(false));
		dispatch(walletActions.setIsPendingOwner(false));
		dispatch(walletActions.setIsAcceptOwner(false));

		try {
			let mirrorNode;
			if (selectedMirrors.length > 0) {
				const listMirrors = selectedMirrors.filter(
					(obj: IMirrorRPCNode) =>
						obj.Environment.toLocaleLowerCase() === network.toLocaleLowerCase(),
				);
				if (listMirrors) mirrorNode = listMirrors[0];
			}
			let rpcNode;
			if (selectedRPCs.length > 0) {
				const listRPCs = selectedRPCs.filter(
					(obj: IMirrorRPCNode) =>
						obj.Environment.toLocaleLowerCase() === network.toLocaleLowerCase(),
				);
				if (listRPCs) rpcNode = listRPCs[0];
			}

			const result = await SDKService.connectWallet(
				wallet,
				network,
				mirrorNode,
				rpcNode,
				custodialSettings,
			);

			const newselectedMirrors: IMirrorRPCNode[] = [];

			selectedMirrors.forEach((obj) => {
				newselectedMirrors.push(obj);
			});

			if (!mirrorNode) {
				newselectedMirrors.push(result[1] as IMirrorRPCNode);
			}

			dispatch(walletActions.setSelectedMirrors(newselectedMirrors));

			const newselectedRPCs: IMirrorRPCNode[] = [];

			selectedRPCs.forEach((obj) => {
				newselectedRPCs.push(obj);
			});

			if (!rpcNode) {
				newselectedRPCs.push(result[2] as IMirrorRPCNode);
			}

			dispatch(walletActions.setSelectedRPCs(newselectedRPCs));

			const factoryId = await Network.getFactoryAddress();

			if (factoryId) {
				const factoryProxyConfig: StableCoinListViewModel = await getFactoryProxyConfig(factoryId);
				dispatch(walletActions.setSelectedNetworkFactoryProxyConfig(factoryProxyConfig));
			}
			dispatch(walletActions.setIsFactoryProxyOwner(false));
			dispatch(walletActions.setIsFactoryPendingOwner(false));
			dispatch(walletActions.setIsFactoryAcceptOwner(false));
		} catch (error: any) {
			if ('errorCode' in error && error.errorCode === '40009') {
				setRejected(true);
			} else {
				setError(error.message);
			}
			setLoading(undefined);
		}
	};

	const getFactoryProxyConfig = async (factoryId: string): Promise<StableCoinListViewModel> => {
		const factoryProxyConfig: any = await Promise.race([
			SDKService.getFactoryProxyConfig(
				new GetFactoryProxyConfigRequest({
					factoryId,
				}),
			),
			new Promise((resolve, reject) => {
				setTimeout(() => {
					reject(new Error("Stablecoin details couldn't be obtained in a reasonable time."));
				}, 10000);
			}),
		]).catch((e) => {
			if (e.code === 'NETWORK_ERROR') {
				throw new Error('The RPC service is not working as expected');
			}
			throw e;
		});
		return factoryProxyConfig;
	};

	const handleConnectHashpackWallet = () => {
		setHashpackSelected(true);
	};

	const unHandleConnectHashpackWallet = () => {
		setHashpackSelected(false);
		setLoading(undefined);
	};

	const handleConnectHashpackWalletConfirmed = () => {
		const values = getValues();
		handleWalletConnect(SupportedWallets.HASHPACK, values.networkHashpack.value);
	};

	const networkOptions = [{ value: 'testnet', label: 'Testnet' }];
	if (
		process.env.REACT_APP_ONLY_TESTNET === undefined ||
		process.env.REACT_APP_ONLY_TESTNET === 'false'
	) {
		networkOptions.push({ value: 'mainnet', label: 'Mainnet' });
	}

	const handleConnectMetamaskWallet = () => {
		handleWalletConnect(SupportedWallets.METAMASK, '-');
	};

	const handleConnectBladeWallet = () => {
		setBladeSelected(true);
	};

	const unHandleConnectBladeWallet = () => {
		setBladeSelected(false);
		setLoading(undefined);
	};

	const handleConnectBladeWalletConfirmed = () => {
		const values = getValues();
		handleWalletConnect(SupportedWallets.BLADE, values.networkBlade.value);
	};
	//* Custodial
	// Fireblocks
	const handleConnectFireblocks = () => {
		onWalletSelectClose(); // Cierra el modal de selección de wallet
		onFireblocksFormOpen(); // Abre el modal del formulario
	};

	const handleFireblocksFormConfirm = (formData: FireblocksFormValues) => {
		// TODO: Remove this
		console.log('Datos del formulario:', formData);
		onFireblocksFormClose();
		handleWalletConnect(
			SupportedWallets.FIREBLOCKS,
			'testnet',
			FireblocksSettings.fromForm(formData),
		);
	};
	// Dfns
	const handleConnectDfns = () => {
		onWalletSelectClose(); // Cierra el modal de selección de wallet
		onDfnsFormOpen(); // Abre el modal del formulario
	};

	const handleDfnsFormConfirm = (formData: DfnsFormValues) => {
		// TODO: Remove this
		console.log('Datos del formulario:', formData);

		onDfnsFormClose();
		handleWalletConnect(SupportedWallets.DFNS, 'testnet', DfnsSettings.fromForm(formData));
	};

	const PairingSpinner: FC<{ wallet: SupportedWallets; children?: ReactNode }> = ({
		wallet,
		children,
	}) => {
		return (
			<>
				{loading && loading === wallet && (
					<HStack w={20} justifyContent='center' alignItems={'center'} h='full'>
						<Spinner
							w={50}
							h={50}
							justifyContent='center'
							alignSelf={'center'}
							color={wallet === SupportedWallets.HASHPACK ? '#C6AEFA' : '#f39c12'}
							thickness='8px'
						/>
					</HStack>
				)}
				{(!loading || loading !== wallet) && children}
			</>
		);
	};

	/**
	 * Checks if the user agent is Chrome.
	 * @param {string} userAgent - The user agent string.
	 * @returns {boolean} - Returns true if the user agent is Chrome, false otherwise.
	 */
	const isChrome = (userAgent: string): boolean => {
		return userAgent.indexOf('Chrome') !== -1;
	};

	return (
		<>
			<Modal
				isOpen={true}
				onClose={onWalletSelectClose}
				size={'xl'}
				isCentered
				closeOnEsc={false}
				closeOnOverlayClick={false}
			>
				<ModalOverlay />
				<ModalContent data-testid='modal-action-content' p='10' maxW='1000px'>
					{!error && !rejected && !hashpackSelected && !bladeSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									data-testid='title'
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter p='0' justifyContent='center'>
								<HStack
									spacing={10}
									pt={8}
									w='full'
									justifyContent={'center'}
									alignItems={'stretch'}
								>
									<VStack justifyContent='center' spacing={0} {...styles.walletGroup}>
										<Tooltip
											label={t('walletActions.walletGroups.selfCustodialTT')}
											placement='right'
										>
											<Text fontSize='15px' lineHeight='16px' fontWeight={700}>
												{t('walletActions.walletGroups.selfCustodial')}
											</Text>
										</Tooltip>
										<HStack
											spacing={5}
											pt={8}
											w='full'
											justifyContent={'left'}
											alignItems={'stretch'}
										>
											{availableWallets.includes(SupportedWallets.HASHPACK) ? (
												<VStack
													data-testid={t('walletActions.supportedWallets.hashpack')}
													{...styles.providerStyle}
													shouldWrapChildren
													onClick={handleConnectHashpackWallet}
												>
													<PairingSpinner wallet={SupportedWallets.HASHPACK}>
														<Image src={HASHPACK_LOGO_PNG} w={20} />
														<Text>{t('walletActions.supportedWallets.hashpack')}</Text>
													</PairingSpinner>
												</VStack>
											) : (
												<VStack
													data-testid={t('walletActions.supportedWallets.hashpack')}
													{...styles.providerStyle}
												>
													<Link
														href='https://www.hashpack.app/download'
														isExternal
														_hover={{ textDecoration: 'none' }}
													>
														<Image src={HASHPACK_LOGO_PNG} w={20} />
														<Text>{t('walletActions.supportedWallets.hashpack')}</Text>
													</Link>
												</VStack>
											)}
											{availableWallets.includes(SupportedWallets.METAMASK) ? (
												<VStack
													data-testid={t('walletActions.supportedWallets.metamask')}
													{...styles.providerStyle}
													shouldWrapChildren
													onClick={handleConnectMetamaskWallet}
												>
													<PairingSpinner wallet={SupportedWallets.METAMASK}>
														<Image src={METAMASK_LOGO} w={20} />
														<Text textAlign='center' paddingTop={1}>
															{t('walletActions.supportedWallets.metamask')}
														</Text>
													</PairingSpinner>
												</VStack>
											) : (
												<VStack
													data-testid={t('walletActions.supportedWallets.metamask')}
													{...styles.providerStyle}
												>
													<Link
														href='https://metamask.io/download/'
														isExternal
														_hover={{ textDecoration: 'none' }}
													>
														<Image src={METAMASK_LOGO} w={20} />
														<Text textAlign='center' paddingTop={1}>
															{t('walletActions.supportedWallets.metamask')}
														</Text>
													</Link>
												</VStack>
											)}
											{isChrome(navigator.userAgent) ? (
												availableWallets.includes(SupportedWallets.BLADE) ? (
													<VStack
														data-testid={t('walletActions.supportedWallets.blade')}
														{...styles.providerStyle}
														shouldWrapChildren
														onClick={handleConnectBladeWallet}
													>
														<PairingSpinner wallet={SupportedWallets.BLADE}>
															<Image src={BLADE_LOGO_PNG} w={20} />
															<Text textAlign='center' paddingTop={1}>
																{t('walletActions.supportedWallets.blade')}
															</Text>
														</PairingSpinner>
													</VStack>
												) : (
													<VStack
														data-testid={t('walletActions.supportedWallets.blade')}
														{...styles.providerStyle}
													>
														<Link
															href='https://bladewallet.io/'
															isExternal
															_hover={{ textDecoration: 'none' }}
														>
															<Image src={BLADE_LOGO_PNG} w={20} />
															<Text textAlign='center' paddingTop={1}>
																{t('walletActions.supportedWallets.blade')}
															</Text>
														</Link>
													</VStack>
												)
											) : (
												<></>
											)}
										</HStack>
									</VStack>
									<VStack justifyContent='center' spacing={0} {...styles.walletGroup}>
										<Tooltip label={t('walletActions.walletGroups.custodialTT')} placement='right'>
											<Text
												fontSize='15px'
												lineHeight='16px'
												fontWeight={700}
												justifyContent={'center'}
											>
												{t('walletActions.walletGroups.custodial')}
											</Text>
										</Tooltip>
										<HStack spacing={5} pt={8} w='fit-content' justifyContent={'right'}>
											<VStack
												data-testid={t('walletActions.supportedWallets.fireblocks')}
												{...styles.providerStyle}
												shouldWrapChildren
												onClick={handleConnectFireblocks}
											>
												<PairingSpinner wallet={SupportedWallets.FIREBLOCKS}>
													<Image src={FIREBLOCKS_LOGO_PNG} w={20} />
													<Text textAlign='center' paddingTop={1}>
														{t('walletActions.supportedWallets.fireblocks')}
													</Text>
												</PairingSpinner>
											</VStack>
											<VStack
												data-testid={t('walletActions.supportedWallets.dfns')}
												{...styles.providerStyle}
												shouldWrapChildren
												onClick={handleConnectDfns}
											>
												<PairingSpinner wallet={SupportedWallets.DFNS}>
													<Image src={DFNS_LOGO_PNG} w={20} />
													<Text textAlign='center' paddingTop={1}>
														{t('walletActions.supportedWallets.dfns')}
													</Text>
												</PairingSpinner>
											</VStack>
										</HStack>
									</VStack>
								</HStack>
							</ModalFooter>
						</>
					)}
					{hashpackSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<VStack>
									<SelectController
										control={control}
										isRequired
										name='networkHashpack'
										defaultValue='0'
										options={networkOptions}
										addonLeft={true}
										overrideStyles={styles.networkOptions}
										variant='unstyled'
									/>
									<HStack>
										<Button
											data-testid='modal-notification-button-Hashpack'
											onClick={unHandleConnectHashpackWallet}
											variant='secondary'
										>
											{t('common.cancel')}
										</Button>
										<Button
											data-testid='modal-notification-button-Hashpack'
											onClick={handleConnectHashpackWalletConfirmed}
											variant='primary'
										>
											{t('common.accept')}
										</Button>
									</HStack>
								</VStack>
							</ModalFooter>
						</>
					)}
					{bladeSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<VStack>
									<SelectController
										control={control}
										isRequired
										name='networkBlade'
										defaultValue='0'
										options={networkOptions}
										addonLeft={true}
										overrideStyles={styles.networkOptions}
										variant='unstyled'
									/>
									<HStack>
										<Button
											data-testid='modal-notification-button-Blade'
											onClick={unHandleConnectBladeWallet}
											variant='secondary'
										>
											{t('common.cancel')}
										</Button>
										<Button
											data-testid='modal-notification-button-Blade'
											onClick={handleConnectBladeWalletConfirmed}
											variant='primary'
										>
											{t('common.accept')}
										</Button>
									</HStack>
								</VStack>
							</ModalFooter>
						</>
					)}
					{(error || rejected) && (
						<>
							<ModalHeader alignSelf='center' p='0'>
								<Image
									data-testid='modal-notification-icon'
									src={error ? ERROR_ICON : WARNING_ICON}
									width='54px'
									height='54px'
								/>
							</ModalHeader>
							<ModalBody textAlign='center' pt='14px'>
								<Text
									data-testid='modal-notification-title'
									fontSize='14px'
									fontWeight={700}
									lineHeight='16px'
									color='brand.black'
								>
									{error ?? t('pairing.rejected')}
								</Text>
							</ModalBody>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<Button
									data-testid='modal-notification-button'
									onClick={() => {
										dispatch(walletActions.clearData());
										setError(undefined);
										setRejected(false);
									}}
									variant='primary'
								>
									{t('common.goBack')}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<FireblocksFormModal
				isOpen={isFireblocksFormOpen}
				onClose={onFireblocksFormClose}
				onConfirm={handleFireblocksFormConfirm}
			/>
			<DfnsFormModal
				isOpen={isDfnsFormOpen}
				onClose={onDfnsFormClose}
				onConfirm={handleDfnsFormConfirm}
			/>
		</>
	);
};

export default ModalWalletConnect;
