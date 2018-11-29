import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import config from '../config.json';
import { getRootRelativePath } from './utils';

function getWebpackConfigBase(outputFilename, outputChunkFilename) {
  return {
    entry: {
      app: [
        // TODO 'react-hot-loader/patch',
        getRootRelativePath('src/index.tsx')
      ]
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
        title: 'GDMN - QB',
        // template params
        appMountNodeId: config.webpack.appMountNodeId,
        description: 'query builder',
        mobile: true
      }),
      new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
      alias: {
        '@src': getRootRelativePath('src'),
        configFile: getRootRelativePath('configs/config.json')
      },
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json']
    }
  };
}

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true
  }
};

let cssModulesLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: true,
    importLoaders: 1,
    localIdentName: '[name]__[local]__[hash:base64:5]'
  }
};

cssModulesLoader = cssLoader;

export { getWebpackConfigBase, cssLoader, cssModulesLoader };
