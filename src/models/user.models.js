import Taro from '@tarojs/taro'

import { login } from '../services/user';
import { judge, popup } from '../services/home';
import { receive } from '../services/coupon';

export default {
    namespace: 'user',
    state: {
        info: {
            nickName: null,
            avatarUrl: null
        },
        couponJudge: {
            isHaveCoupon: true,
            image: ''
        },
        dialog: {
            visible: false,
            image: '',
            type: null,
            url: ''
        },
        popup: {
            list: [],
            activeIndex: -1
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
            yield put({
                type: 'saveUserInfo',
                payload: response.data.data || {}
            })
            const couponJudge = yield call(judge);
            const popupList = yield call(popup);
            yield put({
                type: 'saveCouponJudge',
                payload: couponJudge.data.data
            })
            yield put({
                type: 'savePopup',
                payload: {
                    list: popupList.data.data
                }
            })
            if (!couponJudge.data.data.isHaveCoupon) {
                return yield put({
                    type: 'saveDialog',
                    payload: {
                        visible: true,
                        image: couponJudge.data.data.image,
                        type: 'coupon'
                    }
                })
            }
            if (popupList.data.data.length > 0) {
                yield put({
                    type: 'savePopup',
                    payload: {
                        activeIndex: 0
                    }
                })
                yield put({
                    type: 'saveDialog',
                    payload: {
                        visible: true,
                        image: popupList.data.data[0].image,
                        url: popupList.data.data[0].url,
                        type: 'popup'
                    }
                })
            }
        },
        *clickDialog(action, { call, put, select }) {
            const { dialog, popup } = yield select((state) => {
                return state.user;
            })
            if (dialog.type === 'coupon') {
                yield call(receive);
            }
            if (dialog.type === 'popup') {
                Taro.navigateTo({
                    url: `/pages/webview/index?url=${dialog.url}`
                })
            }
            if (popup.activeIndex < (popup.list.length - 1)) {
                yield put({
                    type: 'savePopup',
                    payload: {
                        activeIndex: popup.activeIndex + 1
                    }
                })
                const popupItem = popup.list[popup.activeIndex + 1];
                yield put({
                    type: 'saveDialog',
                    payload: {
                        image: popupItem.image,
                        url: popupItem.url,
                        type: 'popup'
                    }
                })
                return;
            }
            yield put({
                type: 'saveDialog',
                payload: {
                    visible: false
                }
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
        },
        saveCouponJudge(state, { payload }) {
            return {
                ...state,
                couponJudge: payload
            }
        },
        saveDialog(state, { payload }) {
            return {
                ...state,
                dialog: {
                    ...state.dialog,
                    ...payload
                }
            }
        },
        savePopup(state, { payload }) {
            return {
                ...state,
                popup: {
                    ...state.popup,
                    ...payload
                }
            }
        },
    }
}
