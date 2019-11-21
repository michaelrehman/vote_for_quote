const cssExtract = require('mini-css-extract-plugin');

module.exports = {
	mode: 'production',
	entry: {
		quotes: './client/js/quotes.js',
		css: './client/scss/main.scss'
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
			}
		]
	}
};