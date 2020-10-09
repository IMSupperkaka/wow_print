import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { create, all } from 'mathjs'

import { store, app } from './dva'
import './app.less'
import './custom-variables.scss'

const math = create(all, {})

class App extends Component {

    onLaunch(props) {
        if (Taro.getEnv() == 'WEB') {
            return;
        }
        const { dispatch } = app;
        dispatch({
            type: 'user/login',
            payload: {
                channel: props.query.channel,
                success: () => {
                    dispatch({
                        type: 'home/getDialog'
                    })
                }
            }
        })
        const updateManager = Taro.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
            Taro.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(function (err) {
            // 新的版本下载失败
            console.log(err);
        })
    }

    render() {
        // [[a, c, e], [b, d, f], [0, 0, 1]]
        // [[ax + cy + e], [bx + dy + f], [0, 0, 1]]
        const translateMatrix = math.matrix([[1, 0, 30], [0, 1, 30], [0, 0, 1]]);
        const scaleMatrix = math.matrix([[1.2, 0, 0], [0, 1.2, 0], [0, 0, 1]]);
        const rotateMatrix = math.matrix([[Math.cos(Math.PI / 2), -Math.sin(Math.PI / 2), 0], [Math.sin(Math.PI / 2), -Math.cos(Math.PI / 2), 0], [0, 0, 1]]);

        console.log(math.multiply(rotateMatrix, translateMatrix, scaleMatrix));

        return (
            <Provider store={store}>
                {this.props.children}
            </Provider>
        )
    }
}

export default App
