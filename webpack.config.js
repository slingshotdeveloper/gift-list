/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/gift-list.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js', 
    clean: true,
    publicPath: '/gift-list/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.module\.less$/i, // Matches files like `App.module.less`
        include: path.resolve(__dirname, 'src'),
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: true, sourceMap: true }, // Enables CSS Modules
          },
          'postcss-loader', // Optional, if you're using PostCSS
          'less-loader',
        ],
      },
      {
        test: /\.less$/i,
        exclude: /\.module\.less$/, // Excludes CSS Modules
        use: ['style-loader', 'css-loader', 'less-loader'],
      },

      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: false,
            },
          },
          {
            loader: 'file-loader',
            options: {
              name: 'assets/icons/[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'public'),
    port: 3000,
    historyApiFallback: {
      index: '/gift-list/', // Ensures routing works properly
    },
    open: ['http://localhost:3000/gift-list']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
  ],
};
