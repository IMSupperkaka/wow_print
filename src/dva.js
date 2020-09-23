
import Taro from '@tarojs/taro'
import { create } from 'dva-core'
import createLoading from 'dva-loading'
import models from './models'

let dispatch

function createApp(opt) {
    let store
    const app = create(opt)
    app.use(createLoading({}))

    if (!global.registered) opt.models.forEach(model => app.model(model))
    global.registered = true
    app.start()

    store = app._store
    app.getStore = () => store

    dispatch = store.dispatch

    app.dispatch = dispatch
    return app
}

const dvaApp = createApp({
    initialState: {},
    enableLog: false,
    models: models
})

export const store = dvaApp.getStore();

export const app = dvaApp;
