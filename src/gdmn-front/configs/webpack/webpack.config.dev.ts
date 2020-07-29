import path from 'path';
import { EnvironmentPlugin, HotModuleReplacementPlugin, NamedModulesPlugin } from 'webpack';
import { merge } from 'webpack-merge';
import { CheckerPlugin } from 'awesome-typescript-loader';
// @ts-ignore
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin';

import { getRootRelativePath } from './utils';
import { getWebpackConfigBase, cssLoader, cssModulesLoader } from './webpackConfigBase';

const OUTPUT_FILENAME = 'scripts/[name].bundle.js';
const OUTPUT_CHUNK_FILENAME = 'scripts/[name].chunk.js';
const STYLES_PATH = getRootRelativePath('src/styles');

/**
 * Непонятно почему, но типы @types/webpack записываются дважды
 * в корень проекта и в локальную папку для gdmn-front. и они разные
 * из-за чего происходит ошибка. сейчас мы непосредственно приводим
 * к типу any. В будущем перепроверить и убрать приведение.
 */

const config = merge(
  // {
  //   entry: {
  //     app: [
  //       'webpack/hot/only-dev-server',
  //       // bundle the client for hot reloading
  //       // only- means to only hot reload for successful updates
  //       // https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md#i-see-hmr-nothing-hot-updated-and-nothing-happens-when-i-edit-appjs
  //     ]
  //   }
  // },
  getWebpackConfigBase(OUTPUT_FILENAME, OUTPUT_CHUNK_FILENAME) as any,
  {
    devtool: 'cheap-module-source-map',
    mode: 'development',
    devServer: {
      host: 'localhost',
      port: 9090,
      historyApiFallback: true,
      hot: true /* HMR*/,
      inline: true /* HMR*/,
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
              loader: 'react-hot-loader/webpack'
            },
            {
              loader: 'awesome-typescript-loader',
              options: {
                useCache: true,
                forceIsolatedModules: true // todo
                // transpileOnly: true // disable type checker - we will use it in fork plugin
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
      new HotModuleReplacementPlugin(), // todo: remove (<= hot: true)
      /* prints more readable module names in the browser console on HMR updates */
      new NamedModulesPlugin() // todo: deprecated
    ],
    context: path.resolve(__dirname, '../../') /* to auto find tsconfig.json*/
  }
);

// tslint:disable-next-line no-default-export
export default config;
