const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.wasm$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@provablehq/sdk': path.resolve(__dirname, '../snorkle-test-interface/node_modules/@provablehq/sdk'),
            '@provablehq/wasm': path.resolve(__dirname, '../snorkle-test-interface/node_modules/@provablehq/wasm'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../snorkle-test-interface/node_modules/@provablehq/wasm/dist/testnet/aleo_wasm.wasm'),
                    to: path.resolve(__dirname, 'dist/aleo_wasm.wasm'),
                },
            ],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        hot: true,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
    },
    experiments: {
        asyncWebAssembly: true,
    },
}; 