const cssExtract = require('mini-css-extract-plugin');

module.exports = {
	mode: 'production',
	entry: {
		client: './client/js/client.js',
		css: './client/scss/main.scss' // this generates an empty js file // TODO: get rid of it
	},
	output: {
		path: require('path').resolve(__dirname, 'dist'),
		filename: 'js/[name].js'
	},
	plugins: [
		new cssExtract({ filename: 'css/main.css' }),
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					cssExtract.loader,
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};