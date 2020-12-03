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
                let moment = (new Date()).getTime();
                let popups = popupList.data.data
                let canPopupList = []
                let popupStorage = Taro.getStorageSync("popup-rule") || [];
                let newStorageList = JSON.parse(JSON.stringify(popupStorage))
                popups.forEach((popup) => {
                    let curIndex = popupStorage.findIndex((item) => (popup.id == item.id)), storageItem = {};
                    if(curIndex >= 0) {
                        // 已记录过该弹框
                        storageItem = newStorageList[curIndex];
                        if(moment <= storageItem.resetTimeLimit && storageItem.num < popup.daysShowTimes) {
                            // 推入待弹出popup数组
                            canPopupList.push(popup)
                            storageItem.num ++
                        }
                        if(moment > storageItem.resetTimeLimit) {
                            canPopupList.push(popup)
                            // 重置时间和次数等变量
                            newStorageList.splice(curIndex, 1, {
                                id: popup.id,
                                // 天数重置时间戳
                                resetTimeLimit: moment + popup.intervalDays * 24 * 60 * 60 * 1000,
                                // 次数限制
                                numLimit: popup.daysShowTimes,
                                // 已弹次数
                                num: 1
                            })
                        }
                    } else {
                        // 未记录该弹框
                        canPopupList.push(popup)
                        newStorageList.push({
                            id: popup.id,
                            resetTimeLimit: moment + popup.intervalDays * 24 * 60 * 60 * 1000,
                            numLimit: popup.daysShowTimes,
                            num: 1
                        })
                    }
                })
                Taro.setStorageSync("popup-rule", newStorageList)
                
                yield put({
                    type: 'savePopup',
                    payload: {
                        list: canPopupList
                    }
                })
                
                if(canPopupList.length) {
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
                            image: canPopupList[0]?.image,
                            url: canPopupList[0]?.url,
                            type: 'popup'
                        }
                    })
                } else {
                    // FIXME:重新编译前上一次弹框没关闭
                    yield put({
                        type: 'savePopup',
                        payload: {
                            activeIndex: -1
                        }
                    })
                    yield put({
                        type: 'saveDialog',
                        payload: {
                            visible: false
                        }
                    })
                }
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
