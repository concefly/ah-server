const path = require('path');
const { Logger } = require('ah-logger');
const webpack = require('webpack');
const wm = require('webpack-merge').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const logger = new Logger('webpack.config');

const CWD = process.cwd();
const distDir = path.resolve(CWD, 'dist');

const ENV = {
  /** @type {'development' | 'production'} */
  mode: process.env.mode || 'development',
};

logger.info(`ENV -> \n${JSON.stringify(ENV, null, 2)}`);

let config = {
  mode: ENV.mode,
  devtool: false,
  entry: {},

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                strictMath: true,
                modifyVars: ENV.theme,
                strictMath: false,
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new webpack.DefinePlugin({
      ENV: Object.entries(ENV).reduce(
        (re, [n, v]) => ({
          ...re,
          [n]: JSON.stringify(v),
        }),
        {}
      ),
    }),
  ],

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.md', '.yaml', '.less'],
  },

  output: {
    filename: '[name].js',
    path: distDir,
  },

  stats: {
    warningsFilter: /export .* was not found in/,
  },

  ...(ENV.mode === 'development' && {
    devServer: {
      contentBase: distDir,
      host: '0.0.0.0',
      port: 8081,
      // https: true,
    },
  }),
};

if (ENV.mode === 'development') {
  config = wm(config, {
    entry: { demo: './demo/index.tsx' },
    plugins: [new HtmlWebpackPlugin({ chunks: ['demo'] })],
  });
}

module.exports = config;
