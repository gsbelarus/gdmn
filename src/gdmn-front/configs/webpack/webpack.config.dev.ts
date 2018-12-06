import path from 'path';
import { Configuration, EnvironmentPlugin, HotModuleReplacementPlugin, NamedModulesPlugin } from 'webpack';
import merge from 'webpack-merge';
import { CheckerPlugin } from 'awesome-typescript-loader';
// @ts-ignore
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin';

import { getRootRelativePath } from './utils';
import { getWebpackConfigBase, cssLoader, cssModulesLoader } from './webpackConfigBase';

const OUTPUT_FILENAME = 'scripts/[name].bundle.js';
const OUTPUT_CHUNK_FILENAME = 'scripts/[name].chunk.js';
const STYLES_PATH = getRootRelativePath('src/styles');

const config: Configuration = merge(getWebpackConfigBase(OUTPUT_FILENAME, OUTPUT_CHUNK_FILENAME), {
  devtool: 'cheap-module-source-map',
  mode: 'development',
  devServer: {
    host: 'localhost',
    port: 9090,
    historyApiFallback: true,
    hot: true, /* HMR*/
    inline: true, /* HMR*/
    open: true,
    publicPath: '/',
    stats: {
      assets: false,
      children: false,
      colors: true,
      modules: false
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [getRootRelativePath('src'), getRootRelativePath('packages')],
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useCache: true,
              useBabel: true,
              babelOptions: {
                babelrc: false,
                plugins: [
                  'react-hot-loader/babel'
                ]
              },
              babelCore: '@babel/core',
              forceIsolatedModules: true, // todo
              transpileOnly: false // transpileOnly: true // disable type checker - we will use it in fork plugin
            }
          }
        ]
      },
      /* styles*/
      {
        test: /\.css$/,
        include: STYLES_PATH,
        use: ['style-loader', cssLoader]
      },
      /* static styles from our own packages of monorepository*/
      {
        test: /\.css$/,
        include: path.resolve(__dirname, '../../../../packages'),
        use: ['style-loader', cssLoader]
      },
      /* css modules*/
      {
        test: /\.css$/,
        include: [getRootRelativePath('src'), getRootRelativePath('packages')],
        exclude: STYLES_PATH,
        use: ['style-loader', cssModulesLoader]
      }
    ]
  },
  plugins: [
    new ErrorOverlayPlugin(),
    new CheckerPlugin(),
    new EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new HotModuleReplacementPlugin(), // todo: test hot: true
    /* prints more readable module names in the browser console on HMR updates */
    new NamedModulesPlugin() // todo: deprecated
  ],
  context: path.resolve(__dirname, '../../') /* to auto find tsconfig.json*/
});

// tslint:disable-next-line no-default-export
export default config;
