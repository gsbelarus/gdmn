import webpack from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { getWebpackConfigBase, cssLoader, cssModulesLoader } from './webpackConfigBase';
import { getRootRelativePath } from './utils';

const OUTPUT_FILENAME = 'scripts/[name].[hash].bundle.js';
const OUTPUT_CHUNK_FILENAME = 'scripts/[name].[chunkhash].chunk.js';
const EXTRACT_CSS_FILENAME = 'styles/[name].[chunkhash].css';
const STYLES_PATH = getRootRelativePath('src/styles');

export default merge(getWebpackConfigBase(OUTPUT_FILENAME, OUTPUT_CHUNK_FILENAME), {
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false
              // cacheDirectory: true,
              //plugins: ['@babel/plugin-syntax-dynamic-import']
            }
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        include: STYLES_PATH,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          cssLoader
        ]
      },
      {
        test: /\.css$/,
        include: getRootRelativePath('src'),
        exclude: STYLES_PATH,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          cssModulesLoader
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true
        // sourceMap: true
      })
      // new OptimizeCSSAssetsPlugin({})
    ]
    // splitChunks: {
    //   cacheGroups: {
    //     vendor: {
    //       chunks: 'initial',
    //       name: 'vendor',
    //       test: 'vendor',
    //       enforce: true
    //     }
    //   }
    // }
  },
  // performance: {
  //   hints: false
  // },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: getRootRelativePath()
    }),
    new MiniCssExtractPlugin({ filename: EXTRACT_CSS_FILENAME }),
    new BundleAnalyzerPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
    })
  ]
});
