import Taro from '@tarojs/taro'

import { login } from '../services/user';

export default {
    namespace: 'user',
    state: {
        info: {
            nickName: null,
            avatarUrl: null
        }
    },
    effects: {
        *login(action, { call, put }) {
            const response = yield call(async () => {
                return new Promise((resolve) => {
                    Taro.login({
                        success: (res) => {
                            login(res.code).then(resolve)
                        }
                    })
                })
            })
            yield  put({
                type: 'saveUserInfo',
                payload: response.data.data || {}
            })
        }  
    },
    reducers: {
        saveUserInfo(state, { payload }) {
            if (payload.token) {
                Taro.setStorageSync('token', payload.token);
            }
            return {
                ...state,
                info: {
                    ...state.info,
                    nickName: payload.nickName || payload.wechatName,
                    avatarUrl: payload.avatarUrl || payload.headImg
                }
            }
        }
    }
}
