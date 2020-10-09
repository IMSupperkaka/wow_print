import Taro from '@tarojs/taro'

import math from '../utils/math'
import { detail } from '../services/address'
import { computeCropUrl } from '../utils/utils'

const defaultAddressInfo = {
    id: null,
    recipient: null,
    phone: null,
    province: null,
    city: null,
    area: null,
    address: null,
    shipMoney: 0
}

const defaultCoupon = {
    id: null,
    couponFreeNums: 0
}

export default {
    namespace: 'confirmOrder',
    state: {
        addressInfo: defaultAddressInfo,
        coupon: defaultCoupon,
        goodId: null,
        userImageList: [],
        activeIndex: 0
    },
    effects: {
        *getAddressDetail({ payload }, { call, put }) {
            const response = yield call(detail, payload.id);
            yield put({
                type: 'saveAddressInfo',
                payload: response.data.data || {}
            })
        },
        *pushUserImg({ payload }, { call, put, select }) {
            const { filePath, res } = payload;
            const img = yield new Promise((resolve) => {
                Taro.getImageInfo({
                    src: filePath,
                    success: (imgres) => {
                        const imgInfo = {
                            ...imgres,
                            origin: [0.5, 0.5],
                            scale: 1,
                            translate: [0, 0],
                            translateMatrix: math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
                            scaleMatrix: math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
                            rotateMatrix: math.matrix([[Math.cos(0), Math.sin(0), 0], [-Math.sin(0), Math.cos(0), 0], [0, 0, 1]])
                        }
                        resolve({
                            originPath: filePath,
                            originImage: res.data,
                            cropImage: computeCropUrl(res.data, { ...imgInfo, contentWidth: 582, contentHeight: 582 / 0.7 }),
                            printNums: 1,
                            imgInfo: imgInfo
                        })
                    }
                })
            })
            yield put({
                type: 'saveUserImageList',
                payload: img
            })
        }
    },
    reducers: {
        initConfirmOrder(state) {
            return {
                ...state,
                addressInfo: defaultAddressInfo,
                coupon: defaultCoupon,
                goodId: null,
                userImageList: [],
                activeIndex: 0
            }
        },
        saveAddressInfo(state, { payload }) {
            return {
                ...state,
                addressInfo: payload
            }
        },
        saveCoupon(state, { payload }) {
            return {
                ...state,
                coupon: payload
            }
        },
        saveGoodId(state, { payload }) {
            return {
                ...state,
                goodId: payload
            }
        },
        saveUserImageList(state, { payload }) {
            if (Array.isArray(payload)) {
                return {
                    ...state,
                    userImageList: payload
                }
            } else {
                return {
                    ...state,
                    userImageList: [
                        ...state.userImageList,
                        payload
                    ]
                }
            }
        },
        saveActiveIndex(state, { payload }) {
            return {
                ...state,
                activeIndex: payload
            }
        }
    }
}
