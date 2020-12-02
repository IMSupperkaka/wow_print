var vConsolePlugin = require('vconsole-webpack-plugin');

module.exports = {
    env: {
        NODE_ENV: '"development"'
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
