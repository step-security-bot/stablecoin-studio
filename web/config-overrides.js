const webpack = require('webpack');

module.exports = function override(config) {
	const fallback = config.resolve.fallback || {};
	Object.assign(fallback, {
		crypto: require.resolve('crypto-browserify'),
		stream: require.resolve('stream-browserify'),
		assert: require.resolve('assert/'),
		http: require.resolve('stream-http'),
		https: require.resolve('https-browserify'),
		os: require.resolve('os-browserify'),
		url: require.resolve('url'),
		path: require.resolve('path-browserify'),
		zlib: require.resolve('browserify-zlib'),
		fs: false,
		vm: false,
		process: false,
	});
	config.resolve.fallback = fallback;
	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
	]);
	config.ignoreWarnings = [/Failed to parse source map/];

	// config to fix @chakra-ui/icon y chakra-react-select compatibility issues (not working)
	config.resolve.alias = {
		...config.resolve.alias,
		'@chakra-ui/icon': '@chakra-ui/react',
		'chakra-react-select': '@chakra-ui/react',
		'@chakra-ui/icon/dist/Icon': '@chakra-ui/react',
	};

	return config;
};
