const webpack = require('webpack');

module.exports = {
	webpack: {
		configure: (webpackConfig) => {
			const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
				({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin',
			);

			if (scopePluginIndex !== -1) {
				// Elimina el ModuleScopePlugin para permitir importaciones fuera de src/
				webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
			}

			// Asegura que los fallbacks se mezclen con la configuración existente
			webpackConfig.resolve.fallback = {
				...webpackConfig.resolve.fallback, // Mantiene los fallbacks existentes
				crypto: require.resolve('crypto-browserify'),
				stream: require.resolve('stream-browserify'),
				assert: require.resolve('assert'),
				http: require.resolve('stream-http'),
				https: require.resolve('https-browserify'),
				os: require.resolve('os-browserify/browser'),
				url: require.resolve('url'),
				path: require.resolve('path-browserify'),
				zlib: require.resolve('browserify-zlib'),
				process: require.resolve('process'),
				buffer: require.resolve('buffer/'),
				fs: false, // Especifica explícitamente 'fs' como false si es necesario
			};

			webpackConfig.plugins.push(
				new webpack.ProvidePlugin({
					Buffer: ['buffer', 'Buffer'],
					process: 'process/browser',
				}),
			);

			webpackConfig.ignoreWarnings = [/Failed to parse source map/];

			return webpackConfig;
		},
	},
};
