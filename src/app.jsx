import React, { Component } from 'react'
import { Provider } from 'react-redux'
import Taro from '@tarojs/taro'

import Base from './layout/Base'
import { store, app } from './dva'
import './app.less'
import './custom-variables.scss'

class App extends Component {

    onLaunch(props) {
        if (Taro.getEnv() == 'WEB') {
            return;
        }
        const { dispatch } = app;
        dispatch({
            type: 'user/login',
            payload: {
                channel: props?.channel,
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
        return (
            <Provider store={store}>
                {this.props.children}
            </Provider>
        )
    }
}

export default App
