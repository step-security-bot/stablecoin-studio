const path = require('path');
const webpack = require('webpack');

// Configuración base común
const baseConfig = {
	module: {
		rules: [
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-typescript',
						],
						plugins: [
							['@babel/plugin-proposal-decorators', { legacy: true }],
						],
					},
				},
			},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js'], // Prioriza .ts y luego .tsx antes de .js
	}
};

module.exports = [
	{
		...baseConfig, // Extiende la configuración base
		target: 'web',
		entry: './src/index.ts', // Actualizado para apuntar al archivo TS
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'bundle-web.js',
		},
		resolve: {
			...baseConfig.resolve,
			fallback: {
				crypto: require.resolve('crypto-browserify'),
				stream: require.resolve('stream-browserify'),
				assert: require.resolve('assert/'),
				http: require.resolve('stream-http'),
				https: require.resolve('https-browserify'),
				os: require.resolve('os-browserify/browser'),
				url: require.resolve('url'),
				path: require.resolve('path-browserify'),
				zlib: require.resolve('browserify-zlib'),
				fs: false,
			},
		},
		devtool: 'source-map', // Optional: Enables source maps
	},
	{
		...baseConfig, // Reutiliza la configuración base para Node.js
		target: 'node',
		entry: './src/index.ts', // Asegúrate de que este es el correcto para Node.js también
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'bundle-node.js',
		},
		// Aquí puedes añadir o sobreescribir cualquier configuración específica para Node.js
	},
];
