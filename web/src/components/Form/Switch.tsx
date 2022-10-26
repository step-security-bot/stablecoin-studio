import Switch from 'react-switch';
import { Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export interface SwitchProps {
	dataTestId: string;
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
}

type SwitchOptions = 'yes' | 'no';
const yes: SwitchOptions = 'yes';
const no: SwitchOptions = 'no';

const SwitchComponent = (props: SwitchProps) => {
	const { dataTestId, checked, disabled, onChange } = props;
	const { t } = useTranslation('global');

	const getText = (option: SwitchOptions) => (
		<VStack h='full' justify={'center'}>
			<Text
				data-testid={`switch-handler-${option}`}
				fontSize={'10px'}
				fontWeight={600}
				lineHeight='14px'
				pl='8px'
			>
				{t(`common.${option}`).toUpperCase()}
			</Text>
		</VStack>
	);

	return (
		<Switch
			activeBoxShadow='0 0 0 0 #fff'
			checked={checked}
			checkedHandleIcon={getText(yes)}
			checkedIcon={false}
			data-testid={dataTestId}
			disabled={disabled}
			handleDiameter={29}
			height={35}
			id='switch-component'
			offColor={'#ffffff'}
			offHandleColor={'#FBCEC6'}
			onChange={onChange}
			onColor={'#ffffff'}
			onHandleColor={'#ADF4DE'}
			uncheckedHandleIcon={getText(no)}
			uncheckedIcon={false}
			width={64}
		/>
	);
};

export default SwitchComponent;
