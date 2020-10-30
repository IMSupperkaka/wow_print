import Taro from '@tarojs/taro'

import { detail } from '../services/address'
import { computeCropUrl, initImg } from '../utils/utils'
import { sizeMap } from '../utils/map/order'
import { EDIT_WIDTH } from '../utils/picContent'
import { list } from '../services/address'

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
        *pushSeletPage({ payload }, { put }) {
            const { goodInfo, portfolioId, userImageList } = payload;
            
            yield put({
                type: 'saveGoodInfo',
                payload: goodInfo
            })

            yield put({
                type: 'savePortfolioId',
                payload: portfolioId || null
            })

            yield put({
                type: 'saveUserImageList',
                payload: userImageList || []
            })

            let path = '';

            switch (goodInfo.category) {
                case 1:
                    path = `/pages/selectPic/index`
                    break;
                case 2:
                    path = `/pages/selectBook/index`
                    break;
                case 3:
                    path = `/pages/deskCalendar/index`
                    break;
            }

            Taro.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.userInfo']) {
                        return Taro.navigateTo({
                            url: `/pages/authInfo/index?redirect=${path}`
                        })
                    }
                    Taro.navigateTo({
                        url: path
                    })
                }
            })

        },
        *getAddressDetail({ payload }, { call, put }) {
            const response = yield call(detail, payload.id);
            yield put({
                type: 'saveAddressInfo',
                payload: response.data.data || {}
            })
        },
        *pushConfirmOrder({ payload }, { call, put, select }) {

            yield put({
                type: 'saveUserImageList',
                payload: payload.resultList.filter((v) => { return v })
            })

            list().then(({ data }) => {
                if (data.data.length <= 0) {
                    Taro.navigateTo({
                        url: `/pages/addressEdit/index?type=add&redirect=${encodeURIComponent('/pages/confirmOrder/index')}`
                    })
                } else {
                    Taro.navigateTo({
                        url: '/pages/confirmOrder/index'
                    })
                }
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
