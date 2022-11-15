import { Box, Button, Flex } from '@chakra-ui/react';
import { Step, Steps } from 'chakra-ui-steps';
import type { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface StepTimeLine {
	number: string;
	label: string;
	content: ReactNode;
}

interface TimeLineProps {
	isValid: boolean;
	steps: StepTimeLine[];
	textDefaultButtonPrimary?: string;
	textLastButtonPrimary?: string;
	textDefaultButtonSecondary?: string;
	textFirstButtonSecondary?: string;
	currentStep: number;
	setCurrentStep: (arg0: number) => void;
	handleFirstButtonSecondary: () => void;
	handleLastButtonPrimary: () => void;
}

const TimeLine = (props: TimeLineProps) => {
	const { t } = useTranslation('global');

	const {
		isValid,
		steps,
		textDefaultButtonPrimary = t('stepper.nextStep'),
		textLastButtonPrimary = t('stepper.finish'),
		textDefaultButtonSecondary = t('stepper.goBack'),
		textFirstButtonSecondary = t('common.cancel'),
		currentStep,
		setCurrentStep,
		handleFirstButtonSecondary,
		handleLastButtonPrimary,
	} = props;

	const handleStep = (e: MouseEvent<HTMLButtonElement>, index: number, type: 'next' | 'prev') => {
		e.preventDefault();

		return type === 'next' ? setCurrentStep(index + 1) : setCurrentStep(index - 1);
	};

	return (
		<Box>
			<Steps orientation='vertical' activeStep={currentStep}>
				{steps.map(({ label, content }) => (
					<Step label={label} key={label}>
						{content}
					</Step>
				))}
			</Steps>
			<Flex width='100%' justify='center'>
				<Button
					mr={4}
					onClick={
						currentStep === 0
							? handleFirstButtonSecondary
							: (e) => handleStep(e, currentStep, 'prev')
					}
					variant='secondary'
				>
					{currentStep === 0 ? textFirstButtonSecondary : textDefaultButtonSecondary}
				</Button>
				<Button
					variant='primary'
					disabled={!isValid}
					onClick={
						currentStep === steps.length - 1
							? handleLastButtonPrimary
							: (e) => handleStep(e, currentStep, 'next')
					}
				>
					{currentStep === steps.length - 1 ? textLastButtonPrimary : textDefaultButtonPrimary}
				</Button>
			</Flex>
		</Box>
	);
};

export default TimeLine;
