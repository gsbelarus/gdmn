import { Configuration, EnvironmentPlugin } from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import TerserPlugin from 'terser-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { getWebpackConfigBase, cssLoader, cssModulesLoader } from './webpackConfigBase';
import { getRootRelativePath } from './utils';

const OUTPUT_FILENAME = 'scripts/[name].[hash].bundle.js';
const OUTPUT_CHUNK_FILENAME = 'scripts/[name].[chunkhash].chunk.js';
const EXTRACT_CSS_FILENAME = 'styles/[name].[chunkhash].css';
const STYLES_PATH = getRootRelativePath('src/styles');

const config: Configuration = merge(getWebpackConfigBase(OUTPUT_FILENAME, OUTPUT_CHUNK_FILENAME), {
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [getRootRelativePath('src'), getRootRelativePath('packages')],
        use: [
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     babelrc: false,
          //     // cacheDirectory: true,
          //     // plugins: ['@babel/plugin-syntax-dynamic-import']
          //   }
          // },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        include: STYLES_PATH,
        use: [MiniCssExtractPlugin.loader, cssLoader]
      },
      {
        test: /\.css$/,
        include: [getRootRelativePath('src'), getRootRelativePath('packages')],
        exclude: STYLES_PATH,
        use: [MiniCssExtractPlugin.loader, cssModulesLoader]
      }
    ]
  },
  output: {
    publicPath: '/'//'/gs/ng/' // TODO test
  },
  optimization: {
    // minimize: true,
    minimizer: [
      new TerserPlugin({ // todo
        cache: true,
        parallel: true
      //   // sourceMap: true
      })
      // new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: getRootRelativePath('')
    }),
    new MiniCssExtractPlugin({ filename: EXTRACT_CSS_FILENAME }),
    // new BundleAnalyzerPlugin(),
    new EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV || 'production'
    })
  ],
  stats: {
    // 'minimal'
    all: false,
    modules: true,
    maxModules: 0,
    errors: true,
    warnings: true,
    // additional options
    entrypoints: true,
    colors: true,
    moduleTrace: true,
    errorDetails: true
  }
});

// tslint:disable-next-line no-default-export
export default config;
