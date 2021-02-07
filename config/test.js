var vConsolePlugin = require('vconsole-webpack-plugin');
console.log('测试环境配置文件被引用了..........................')
module.exports = {
    env: {
        NODE_ENV: '"production"'
    },
    defineConstants: {
        BASE_URL: JSON.stringify('https://testapp.wayinkeji.com'),
        BASE_WEB_URL: JSON.stringify('https://testweb.wayinkeji.com')
    },
    mini: {},
    h5: {
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
    }
}
