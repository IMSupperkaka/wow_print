import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import Taro from '@tarojs/taro'

import { store, app } from './dva'
import './app.less'
import './custom-variables.scss'

class App extends Component {

    onLaunch(props) {
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
