var vConsolePlugin = require('vconsole-webpack-plugin');
module.exports = {
    env: {
        NODE_ENV: '"production"'
    },
    defineConstants: {
        BASE_URL: JSON.stringify('https://app.wayinkeji.com'),
        BASE_WEB_URL: JSON.stringify('https://web.wayinkeji.com')
    },
    mini: {},
    h5: {
        /**
         * 如果h5端编译后体积过大，可以使用webpack-bundle-analyzer插件对打包体积进行分析。
         * 参考代码如下：
         * webpackChain (chain) {
         *   chain.plugin('analyzer')
         *     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
         * }
         */
        webpackChain(chain, webpack) {
            chain.merge({
                plugin: {
                    install: {
                        plugin: vConsolePlugin,
                        args: [{
                            filter: [],
                            enable: true
                        }]
                    }
                }
            })
        }
    },
}
