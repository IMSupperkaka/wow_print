import Taro from '@tarojs/taro'

import { login, saveinfo } from '../services/user';

const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default {
    namespace: 'user',
    state: {
        loadFinish: false,
        info: {
            nickName: null,
            avatarUrl: null,
            token: null
        }
    },
    effects: {
        *saveinfo({ payload }, { call, put }) {
            yield call(saveinfo, {
                headImg: payload.info.avatarUrl,
                wechatName: payload.info.nickName
            })
            yield put({
                type: 'saveUserInfo',
                payload: payload.info
            })
            payload.success();
        },
        *login({ payload }, { call, put }) {
            if (payload.channel) {
                Taro.setStorageSync('channel', payload.channel);
            }
            yield put({
                type: 'setLoadFinish'
            })
            const response = yield call(async () => {
                return new Promise((resolve) => {
                    Taro.login({
                        success: (res) => {
                            login(res.code).then(resolve)
                        }
                    })
                })
            })
            yield put({
                type: 'saveUserInfo',
                payload: response.data.data || {}
            })
            payload.success && payload.success();
        }
    },
    reducers: {
        setLoadFinish(state, { payload }) {
            console.log(1)
            return {
                ...state,
                loadFinish: true
            }
        },
        saveUserInfo(state, { payload }) {
            if (payload.token) {
                Taro.setStorageSync('token', payload.token);
            }
            return {
                ...state,
                info: {
                    ...state.info,
                    nickName: payload.nickName || payload.wechatName,
                    avatarUrl: payload.avatarUrl || payload.headImg,
                    token: payload.token || state.info.token
                }
            }
        }
    }
}
