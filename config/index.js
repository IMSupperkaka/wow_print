/*
 * @Date: 2020-09-09 21:04:30
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 01:08:34
 * @FilePath: \wow_print\config\index.js
 * @Description: Descrip Content
 */

const path = require('path')

const config = {
    projectName: 'photo-taro',
    date: '2020-8-10',
    designWidth: 750,
    deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2
    },
    alias: {
        '@': path.resolve('src'),
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
        '@tarojs/plugin-sass',
        '@tarojs/plugin-less'
    ],
    defineConstants: {
    },
    copy: {
        patterns: [
        ],
        options: {
        }
    },
    framework: 'react',
    mini: {
        postcss: {
            pxtransform: {
                enable: true,
                config: {

                }
            },
            url: {
                enable: true,
                config: {
                    limit: 1024 // 设定转换尺寸上限
                }
            },
            cssModules: {
                enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        }
    },
    h5: {
        publicPath: '/',
        staticDirectory: 'static',
        esnextModules: ['taro-ui'],
        output: {
            filename: "js/[name].[hash:8].js",
            chunkFilename: 'js/[name].[chunkhash:8].js'
        },
        miniCssExtractPluginOption: {
            filename: 'css/[name].[chunkhash:8].css',
            chunkFilename: 'css/[id].[chunkhash:8].css'
        },
        postcss: {
            autoprefixer: {
                enable: true,
                config: {
                }
            },
            cssModules: {
                enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        router: {
            mode: 'browser'
        },
        devServer: {
            proxy: {
                "/api/": {
                    target: "https://testapp.wayinkeji.com",
                    pathRewrite: { "^/api/": "/" },
                    secure: false,
                    changeOrigin: true
                }
            }
        }
    }
}

module.exports = function (merge) {
    if (process.env.BUILD_ENV === 'test') {
        return merge({}, config, require('./test'))
    }
    if (process.env.NODE_ENV === 'development') {
        return merge({}, config, require('./dev'))
    }
    return merge({}, config, require('./prod'))
}
