import isEqual from 'lodash/isEqual';
import Taro from '@tarojs/taro';

let lastState = {};

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
        return state;
    }
}

export default (config) => {

    const { keyPrefix, key, storage, onSet } = { ...defaultConfig, ...config };

    const defaultState = storage.get(`${keyPrefix}:${key}`);

    return createStore => (reducer, initialState = defaultState, enhancer) => {
        const store = createStore(reducer, { ...initialState, ...defaultState }, enhancer);
        function dispatch(action) {
            const res = store.dispatch(action);
            let thatState = store.getState();
            if (!isEqual(lastState, thatState)) {
                lastState = onSet(thatState);
                storage.set(`${keyPrefix}:${key}`, lastState);
            }
            return res;
        }
        return { ...store, dispatch }
    }
}
