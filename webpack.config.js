// Подключение пакетов
const path = require ('path')
const HTMLWebpackPlugin = require ('html-webpack-plugin')
const {CleanWebpackPlugin} = require ('clean-webpack-plugin')
const CopyWebPackPlugin = require ('copy-webpack-plugin')
const MiniCssExtractPlugin = require ('mini-css-extract-plugin')
const TerserWebpackPlugin = require ('terser-webpack-plugin')
const CssMinimizerWebpackPlugin = require ('css-minimizer-webpack-plugin')
const {BundleAnalyzerPlugin} = require ('webpack-bundle-analyzer')
const DelWebpackPlugin = require('del-webpack-plugin')
const autoprefixer = require('autoprefixer')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')


// Переменные для определения режима сборки 
const isDev = process.env.NODE_ENV === 'development'
      isProd = !isDev
isDev ? console.log(`Сборка осуществляется в режиме разработки`) : console.log(`Сборка осуществляется в режиме релиза`)


// Динамическое определение варианта оптимизации
const optimization = _ => {
	const config = {splitChunks: {chunks: 'all'}}
	if (isProd)
	{
		config.minimizer = [
			new TerserWebpackPlugin(),
			new CssMinimizerWebpackPlugin()
		]
	}
	return config
}


// Динамическое определение имени файле
const filename = ext => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`


// Динамическое определение лоадера для стилей
const cssLoaders = extra => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {publicPath: ''}
		},
		'css-loader',
		'postcss-loader'
	]
	if (extra) loaders.push(extra)	
	return loaders
}


// Динамическое добавление плагинов
const plugins = _ => {
	const base = [
		new HTMLWebpackPlugin({
			title: 'Форма оплаты',
			template: './index.html',
			minify: {collapseWhitespace: isProd}
		}),
		new	CleanWebpackPlugin(),
		new CopyWebPackPlugin({
			patterns:[		
				{from: path.resolve(__dirname, 'src/assets/imgs/banks-logos'), to: path.resolve(__dirname, 'app/assets/imgs/banks-logos')},
				{from: path.resolve(__dirname, 'src/assets/imgs/brands-logos'), to: path.resolve(__dirname, 'app/assets/imgs/brands-logos')}
			]
		}),
		new MiniCssExtractPlugin({filename: filename('css')}),
		new ImageMinimizerPlugin({
			minimizerOptions: {
			  plugins: [
				['gifsicle', {interlaced: true}],
				['jpegtran', {progressive: true}],
				['optipng', {optimizationLevel:5}],
				["svgo",{
					plugins: [
						{
						  name: 'preset-default',
						  params: {overrides:{
							  inlineStyles: {onlyMatchedOnce: false},
							  removeDoctype: false,
						  }}
						},
						'prefixIds',
						{
						  name: 'sortAttrs',
						  params: {xmlnsOrder: 'alphabetical'},
						}
					]
				}]
			  ]
			}
		})
	]
	if (isProd)
	{
		new DelWebpackPlugin({
	      include: ['**'],
	      info: true,
	      keepGeneratedAssets: true,
	    }),		
		base.push(new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: path.resolve(__dirname, 'app/assets/bundleAnalyzerInfo.html')
		}))
	}
	return base
} 


module.exports = {
	context: path.resolve(__dirname, 'src'),
	
	cache: {type: 'filesystem'},

	entry: './js/index.js',

	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'app')
	},
	
	resolve: {
		extensions: ['.js', '.json', '.jpg', '.xml', '.csv', '.css', '.less', '.sass', '.scss'],		
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@styles': path.resolve(__dirname, 'src/styles'),
			'@imgs': path.resolve(__dirname, 'src/assets/imgs'),
			'@info': path.resolve(__dirname, 'src/assets/info'),
			'@fonts': path.resolve(__dirname, 'src/assets/fonts')
		}		
	},
		
	optimization: optimization(), 
	
	devServer: {
		port: 8000,
		contentBase: path.resolve(__dirname, 'src/index.html'),
		watchContentBase: true,
		hot: isDev
	},
	
	devtool: isDev ? 'source-map' : false,
	
	plugins: plugins(),
	
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {presets: ['@babel/preset-env']}
				}
			},
			{
				test: /\.css$/i,
				use: cssLoaders()
			},
			{
				test: /\.less$/i,
				use: cssLoaders('less-loader')
			},
			{
				test: /\.s[ac]ss$/i,
				use: cssLoaders('sass-loader')
			},				
			{ 
				test: /\.(png|jpg|svg|gif)$/i,
				type: 'asset/resource',
				generator: {filename: 'assets/imgs/[hash][ext][query]'}
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/i,
				type: 'asset/resource',
				generator: {filename: 'assets/fonts/[hash][ext][query]'}
			},			
			{
				test: /\.xml$/i,
				use: ['xml-loader']
			},
			{
				test: /\.csv$/i,
				use: ['csv-loader']
			}			
		]
	}		
}