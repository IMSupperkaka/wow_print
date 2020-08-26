import React, { Component } from 'react'
import { Provider } from 'react-redux'

import dva from './dva'
import models from './models'
import './app.less'
import './custom-variables.scss'
import 'taro-ui/dist/style/index.scss'

const dvaApp = dva.createApp({
    initialState: {},
    enableLog: false,
    models: models,
})

const store = dvaApp.getStore()

class App extends Component {
    componentDidMount() { }

    componentDidShow() { }

    componentDidHide() { }

    componentDidCatchError() { }

    // global provider
    render() {
        return (
            <Provider store={store}>
                {this.props.children}
            </Provider>
        )
    }
}

export default App
