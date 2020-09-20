import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import Taro from '@tarojs/taro'

import dva from './dva'
import models from './models'
import './app.less'
import './custom-variables.scss'

const dvaApp = dva.createApp({
  initialState: {},
  enableLog: false,
  models: models,
})

const store = dvaApp.getStore()

class App extends Component {

  onLaunch(props) {
    const { dispatch } = store;
    dispatch({
      type: 'user/login',
      payload: {
        channel: props.query.channel
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
