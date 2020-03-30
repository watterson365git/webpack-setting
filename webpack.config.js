const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
// const workboxWebpackPlugin = require("workbox-webpack-plugin")//PWA
// const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin")//dll优化用的
const AutoDllPlugin = require("autodll-webpack-plugin");//自动dll插件,好用
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const webpack = require('webpack');


module.exports = {
    mode: "production",
    devServer: {
        //dev-server不会有输出,只在内存中编译
        //构建后的目录里作为服务器运行的环境
        contentBase: path.resolve(__dirname, './dist'),
        //启动gzip压缩
        compress: true,
        //端口号
        port: 3000,
        //自动打开浏览器(默认浏览器)
        open: true,
        //url地址
        host: 'localhost',
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
    },
    devtool: "source-map",
    //项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
    entry: path.resolve(__dirname, './src/main.js'),
    //输出的文件名 合并以后的js会命名为bundle.js
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].[hash:10].js',//输出到js文件夹
        chunkFilename: 'js/[name].[hash:10].js'//动态打包的重命名
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                // //style-loader会创建style标签把css插入html，css-loader会将css文件整合到js文件中
                // loaders: ['style-loader', 'css-loader'],
                // //输出到css文件夹,是不行，要分离才行，现在他和js是一体的  XXX outputPath:'img'

                //分离css文件时候，要用miniCssExtractPlugin.loader代替style-loader使用（不创建style标签）
                //而是分离css并且以外部资源形式引入
                use: [MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: [
                                //postcss的插件，是个数组,其中postcss-preset-env是在package.json中找到browerslist,然后配置兼容性
                                require("postcss-preset-env"),
                                require('autoprefixer')//css加前缀
                            ]
                        }
                    }
                ]

            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader',
                options: {
                    //小于8k会变成base64码,不出现打包的图片,大于8k才会被打包
                    limit: 8 * 1024,
                    //url-loader使用的是es6模块化系统,而webpack用的是commomjs,所以关闭它,否则会报错
                    esModule: false,
                    //图片命名规则:哈希值,十位数,保留原来的图片格式
                    name: '[name].[hash:10].[ext]',
                    //输出到img文件夹
                    outputPath: 'img'
                }

            },

            {//html-loader处理直接插入在HTML中的图片<img>
                test: /\.html$/,
                loader: 'html-loader',
            },

            // {
            //     test: /\.js$/,
            //     loader: 'eslint-loader',
            //     //只检查自己写的源代码，不检查第三方的代码,排除掉node_modules里的js
            //     exclude: /node_modules/,
            //     //设置eslint规则，建议是eslint-config-airbnb-base（不包含react插件），他依赖于eslint-plugin-import，都要装
            //     //在package.json中使用
            //     options: {
            //         //自动修复js的错误（格式错误，不是代码错误）
            //         fix:true
            //     }
            // },

            {//其他格式的文件用file-loader处理
                exclude: /\.(html|css|js|jpg|gif|png)$/,
                loader: "file-loader",
                options: {
                    //命名规则:哈希值,十位数,保留原来的图片格式
                    name: '[name].[hash:10].[ext]',
                    //输出到media文件夹
                    outputPath: 'media'
                }

            },

            {
                test: /\.js$/,
                //只检查自己写的源代码，不检查第三方的代码,排除掉node_modules里的js
                exclude: /node_modules/,
                loader: [
                    {loader: "thread-loader", options: {workers: 2}}, //多进程打包thread-loader,设置为两进程
                    {
                        loader: "babel-loader",
                        options: {
                            //babel开启缓存,第二次打包速度大大提升
                            cacheDirectory: true
                        }
                    }],
            }

        ],

    },

    plugins: [
        // Uglify是压缩js,现在已经不需要了,只需要在script里面写成
        // "build": "webpack --mode production", 就自动压缩了
        // new Uglify(),
        new HtmlWebpackPlugin({
            template: './src/index.html', //模板地址,
            minify: {
                //去除空格
                collapseWhitespace: true,
                //去除注释
                removeComments: true
            }

        }),
        new MiniCssExtractPlugin({
            //分离css文件重命名，同时输出到css文件夹下,10位数哈希
            filename: "css/[hash:10].css",


        }),
        //压缩CSS，直接用就行了
        new OptimizeCssAssetsWebpackPlugin(),

        //Pwa设置
        // new workboxWebpackPlugin.GenerateSW({
        //     //快速启动serviceworker
        //     //更新删除旧版的serviceworker
        //     //到入口js文件中注册serviceworker,并处理兼容性问题
        //     clientsClaim:true,
        //     skipWaiting:true
        //
        //     }
        // ),
        //dll优化配置(手动,难用)
        // new webpack.DllReferencePlugin({
        //     manifest: require('./dll/manifest.json')
        // }),
        // new AddAssetHtmlPlugin({
        //     filepath: path.resolve(__dirname, '../dll/jquery.js'),
        // }),

        //dll优化自动化插件
        new AutoDllPlugin({
            inject: true,  // 设为 true 就把 DLL bundles 插到 index.html 里
            filename: '[name].dll.js',
            entry: {
                vendor: [
                    'jquery'
                ]
            }
        }),
        new HardSourceWebpackPlugin() // <- 直接加入这行代码就行

    ],
    //代码分割(抽取重复的分割方式),建议用动态导入方法( import() )
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all'
    //     }
    // },

    // externals: {
    //     //忽略的库名--:--npm包名
    //     jquery:jQuery
    // }
};