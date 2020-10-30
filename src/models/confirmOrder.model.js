import Taro from '@tarojs/taro'

import { detail } from '../services/address'
import { computeCropUrl, initImg } from '../utils/utils'
import { sizeMap } from '../utils/map/order'
import { EDIT_WIDTH } from '../utils/picContent'

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
        portfolioId: null,
        userImageList: [],
        activeIndex: 0,
        size: 5,
        proportion: 0.7,
        // 商品类型 枚举：/utils/map/product/productType
        type: 1
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
            const { confirmOrder: { proportion } } = yield select();
            const { filePath, res } = payload;
            const img = yield new Promise((resolve) => {
                Taro.getImageInfo({
                    src: filePath,
                    success: (imgres) => {
                        const imgInfo = initImg({
                            ...imgres,
                            origin: [0.5, 0.5],
                            scale: 1,
                            translate: [0, 0]
                        }, { width: EDIT_WIDTH, height: EDIT_WIDTH / proportion })
                        resolve({
                            originPath: filePath,
                            originImage: res.data,
                            cropImage: computeCropUrl(res.data, { ...imgInfo, contentWidth: EDIT_WIDTH, contentHeight: EDIT_WIDTH / proportion }),
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
        saveGoodInfo(state, { payload }) {
            return {
                ...state,
                type: payload.category,
                goodId: payload.id,
                size: payload.size,
                proportion: sizeMap.get(Number(payload.size))
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
        },
        savePortfolioId(state, { payload }) {
            return {
                ...state,
                portfolioId: payload
            }
        }
    }
}
