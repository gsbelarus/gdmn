import { Configuration, NoEmitOnErrorsPlugin, RuleSetLoader } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

// FIXME typings
const pkg = require('../../package.json');
const config = require('../config.json');
import { getRootRelativePath } from './utils';

function getWebpackConfigBase(outputFilename: string, outputChunkFilename: string): Configuration {
  return {
    entry: {
      app: [getRootRelativePath('src/app/index.tsx')]
    },
    output: {
      path: getRootRelativePath(config.webpack.buildPath),
      publicPath: '/',
      filename: outputFilename,
      chunkFilename: outputChunkFilename
    },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: getRootRelativePath('src/assets/favicon.ico'),
        inject: false,
        minify: { collapseWhitespace: true, removeComments: true },
        template: getRootRelativePath('src/index.ejs'),
        title: 'GDMN',
        /* template params */
        appMountNodeId: config.webpack.appMountNodeId,
        description: pkg.description,
        mobile: true
      }),
      new NoEmitOnErrorsPlugin() // fixme deprecated
    ],
    resolve: {
      alias: {
        '@src': getRootRelativePath('src'),
        'config.json': getRootRelativePath('configs/config.json'),
        /* packages */
        '@gdmn/client-core': getRootRelativePath('packages/gdmn-client-core/src'),
        '@gdmn/server-api': getRootRelativePath('packages/gdmn-server-api/src')
      },
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json']
    }
  };
}

const cssLoader: RuleSetLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true
  }
};

const cssModulesLoader: RuleSetLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: true,
    importLoaders: 1,
    localIdentName: '[name]__[local]__[hash:base64:5]'
  }
};

export { getWebpackConfigBase, cssLoader, cssModulesLoader };
