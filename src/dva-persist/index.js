import _ from 'lodash';
import Taro from '@tarojs/taro';

const deepState = (state) => {
    if (Object.prototype.toString.call(state).toLocaleLowerCase() === '[object object]') {
        for (let i in state) {
            if (i === 'filePath' && state['originImage']) {
                state[i] = state['originImage'];
            } else {
                state[i] = deepState(state[i]);
            }
        }
    }
    if (Object.prototype.toString.call(state).toLocaleLowerCase() === '[object array]') {
        for (let i = 0; i < state.length; i++) {
            state[i] = deepState(state[i])
        }
    }
    return state;
}

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
        return deepState(JSON.parse(JSON.stringify(state)));
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
                lastState = onSet(thatState);
                storage.set(`${keyPrefix}:${key}`, lastState);
            }
            return res;
        }
        return { ...store, dispatch }
    }
}
