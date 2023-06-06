const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {

    // 開発モードかどうか
    // モード（none / production / development）
    const IS_DEVELOPMENT = argv.mode === 'development';

    const configs = {

        mode: argv.mode,

        // 開発パス
        entry: {
            'scripts': path.resolve(__dirname, "src/js/scripts.js"),
            'style': path.resolve(__dirname, 'src/scss/style.scss')
        },

        // 出力パス
        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'dist'),
        },

        plugins: [
            // 出力先のフォルダを一旦空に
            new CleanWebpackPlugin({
                // 対象ファイル指定
                cleanOnceBeforeBuildPatterns: [ // 複数ある場合は配列で指定
                    // '**/*', // 出力フォルダ（output: で指定したパス）内のすべてのファイル
                    'css/*',
                    'js/*',
                    'img/*',
                ],
            }),
            new RemoveEmptyScriptsPlugin(), // CSS別出力時の不要JSファイルを削除
            new MiniCssExtractPlugin({ // CSSの出力先
                filename: 'css/[name].css'// 出力ファイル名を相対パスで指定（[name]にはentry:で指定したキーが入る）
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/img'),
                        to: path.resolve(__dirname, 'dist/img'),
                    },
                    {

                        from: path.resolve(__dirname, 'src/js/static.js'),
                        to: path.resolve(__dirname, 'dist/js'),
                    }

                ],
            }),
        ],

        module: {
            rules: [
                // JS
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    // ES5 に変換
                                    "@babel/preset-env"
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.(scss|css|sass)$/,
                    use: [
                        MiniCssExtractPlugin.loader, // JSとCSSを別々に出力する
                        {
                            loader: "css-loader",
                            options: {url: false}
                        },
                        'postcss-loader', // オプションはpostcss.config.jsで指定
                        'sass-loader',
                    ],
                },
            ],
        },
        // node_modules を監視（watch）対象から除外
        watchOptions: {
            followSymlinks: true,
            ignored: /node_modules/,
            // poll: 1000, //毎秒変更を確認します
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            watchFiles: [
                'src/**/*.js',
                'src/**/*.scss',
                'public/**/*'
            ],
        },

    }
    if (IS_DEVELOPMENT) {
        // development であれば、devtool を追加
        configs.devtool = 'cheap-module-source-map';
    }

    return configs;
};