import Taro from '@tarojs/taro';

import { jump } from '../utils/utils';
import { judge, popup } from '../services/home';
import { receive } from '../services/coupon';

export default {
    namespace: 'home',
    state: {
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
        *getDialog({ payload }, { call, put }) {
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
            // TODO:onLaunch时dispatch本函数，在这里通过控制visible来控制弹框弹出，规则修改写在这里。
            console.log('dakai')
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
        *clickDialog({ payload = {} }, { call, put, select }) {
            const { close = false } = payload;
            const { dialog, popup } = yield select((state) => {
                return state.home;
            })
            if (dialog.type === 'coupon') {
                yield call(receive);
            }
            if (dialog.type === 'popup' && !close) {
                jump(dialog.url);
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
