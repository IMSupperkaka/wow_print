import _ from 'lodash';
import Taro from '@tarojs/taro';

const defaultConfig = {
    keyPrefix: 'persist',
    key: 'model',
    storage: {
        get: (key) => {
            return JSON.parse(Taro.getStorageSync(key) || '{}');
        },
        set: (key, value) => {
            Taro.setStorageSync(key, JSON.stringify(value));
        }
    },
    onSet: (state) => {
        state.confirmOrder.userImageList.map((v) => {
            v && (v.filePath = v.originImage)
        })
        state.editimg.imgList.map((v) => {
            v && (v.filePath = v.originImage);
        })
        return state;
    }
}

let lastState = {};

export default (config) => {

    const { keyPrefix, key, storage, onSet } = { ...defaultConfig, ...config };

    const defaultState = storage.get(`${keyPrefix}:${key}`);

    return createStore => (reducer, initialState = defaultState, enhancer) => {
        const store = createStore(reducer, { ...initialState, ...defaultState }, enhancer);
        function dispatch(action) {
            const res = store.dispatch(action);
            let thatState = store.getState();
            if (!_.isEqual(lastState, thatState)) {
                lastState = onSet(_.merge(lastState, thatState));
                storage.set(`${keyPrefix}:${key}`, lastState);
            }
            return res;
        }
        return { ...store, dispatch }
    }
}
