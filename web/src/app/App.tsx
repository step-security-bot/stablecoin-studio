import { I18nextProvider } from 'react-i18next';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import i18n from '../i18n';
import store from '../store/store';
import theme from '../theme/Theme';
import Router from '../Router/Router';
import { BrowserRouter } from 'react-router-dom';
import { Fonts } from '../components/Fonts';
import { Focus } from '../components/Focus';
import { ScrollBar } from '../components/Scrollbar';
import { SDKContextProvider } from '../provider/SDKContext';

function App() {
	// const [SDKInit, setSDKInit] = useState<boolean | undefined>();

	// useEffect(() => {
	// 	instanceSDK();
	// }, []);

	// const instanceSDK = async () => {
	// 	SDKService.getInstance().then((response) => {
	// 		if (response) {
	// 			setTimeout(() => {
	// 				setSDKInit(true);
	// 			}, 100);
	// 		}
	// 	});
	// };

	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				<ChakraProvider theme={theme}>
					<SDKContextProvider>
						<BrowserRouter>
							<Focus />
							<Fonts />
							<ScrollBar />
							<Router />
						</BrowserRouter>
					</SDKContextProvider>
				</ChakraProvider>
			</Provider>
		</I18nextProvider>
	);
}

export default App;
