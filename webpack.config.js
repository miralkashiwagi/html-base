const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const pug = require("pug");

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
            port: 3100,
            open: true,
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            watchFiles: [
                'src/**/*.js',
                'src/**/*.scss',
                'src/**/*.pug'
            ],

            setupMiddlewares: function(middlewares,devServer) {
                if (!devServer) {
                    throw new Error('webpack-dev-server is not defined');
                }

                const pug = require('pug');


                devServer.app.get('/*', function(req, res, next) {
                    const originalUrl = req.originalUrl;
                    if (originalUrl.endsWith('/') || originalUrl.endsWith('.html')) {
                        let targetFile;

                        // If the originalUrl ends with '/', it means we need to find index.pug in the corresponding directory
                        if (originalUrl.endsWith('/')) {
                            const trimmedUrl = originalUrl.replace(/^\/|\/$/g, ''); // remove leading and trailing slashes
                            targetFile = path.join('./src/pug', trimmedUrl, 'index.pug');

                        } else {
                            // If the requested file ends with .html, remove .html and replace with .pug
                            const requestWithoutHtml = originalUrl.replace(/.html$/g, '');
                            const trimmedRequest = requestWithoutHtml.replace(/^\/|\/$/g, ''); // remove leading and trailing slashes
                            targetFile = path.join('./src/pug', `${trimmedRequest}.pug`);
                        }

                        console.log(`compiling ${targetFile}`)
                        const html = pug.renderFile(targetFile);
                        res.send(html);

                    } else {
                        // If the originalUrl does not end with '/' or .html, proceed with the next middleware
                        next();
                    }
                });

                return middlewares;
            },
        },

    }
    if (IS_DEVELOPMENT) {
        // development であれば、devtool を追加
        configs.devtool = 'cheap-module-source-map';
    }

    return configs;
};