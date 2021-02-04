/*
 * @Date: 2020-09-09 21:04:30
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 01:10:03
 * @FilePath: \wow_print\src\models\user.models.js
 * @Description: Descrip Content
 */
import Taro from '@tarojs/taro';
import { v4 as uuidv4 } from 'uuid';

import { getRouterParams } from '../utils/utils';
import { login, wechatLogin, smsLogin, touristLogin, saveinfo, changeToken as getChangeToken } from '../services/user';

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
        *joinLogin({ payload }, { call, put }) {
            const { resolve, changeToken } = payload;
            try {
                const response = yield call(getChangeToken, {
                    changeToken,
                    disabledError: true
                });
                if (response) {
                    sessionStorage.setItem('changeToken', changeToken);
                    sessionStorage.setItem('show_flag', true);
                    yield put({
                        type: 'saveUserInfo',
                        payload: response.data.data
                    })
                }
                resolve();
            } catch (error) {
                console.log(error)
                resolve();
            }
        },
        *login({ payload }, { call, put }) {
            try {
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
            } catch (error) {
                console.log(error)   
            }
        },
        *logout({ payload }, { call, put }) {
            try {
                yield put({
                    type: 'saveToken',
                    payload: null
                })
                yield put({
                    type: 'saveUserInfo',
                    payload: {}
                })
            } catch (error) {
                console.log(error)   
            }
        },
        *wechatLogin({ payload }, { call, put }) {
            try {
                const response = yield call(wechatLogin, {
                    getInfoFlag: true,
                    code: payload.code
                });
                yield put({
                    type: 'saveUserInfo',
                    payload: response.data.data || {}
                })
                payload.resolve && payload.resolve()
            } catch (error) {
                console.error(error)
            }
        },
        *smsLogin({ payload }, { call, put }) {
            try {
                
                const response = yield call(smsLogin, payload);

                if (response.data.data.channel) {
                    Taro.setStorageSync('channel', payload.channel);
                }

                sessionStorage.setItem('show_flag', true);

                yield put({
                    type: 'saveUserInfo',
                    payload: response.data.data || {}
                })

                const redirect = getRouterParams('redirect');

                if (redirect) {
                    Taro.redirectTo({
                        url: redirect
                    })
                } else {
                    Taro.navigateBack();
                }

            } catch (error) {
                console.error(error)
            }
        },
        *touristsLogin({ payload }, { call, put }) {
            try {
                let visitorId = Taro.getStorageSync('uuid');
                if (!visitorId) {
                    visitorId = uuidv4();
                    Taro.setStorageSync('uuid', visitorId);
                }
                const response = yield call(touristLogin, {
                    deviceToken: visitorId
                })
                yield put({
                    type: 'saveUserInfo',
                    payload: response.data.data || {}
                })
                payload?.resolve()
            } catch (error) {
                console.error(error)
            }
        }
    },
    reducers: {
        setLoadFinish(state, { payload }) {
            return {
                ...state,
                loadFinish: true
            }
        },
        saveToken(state, { payload }) {
            Taro.setStorageSync('token', payload);
            return {
                ...state,
                info: {
                    ...state.info,
                    token: payload
                }
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
