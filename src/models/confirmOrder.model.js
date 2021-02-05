import Taro from '@tarojs/taro'

import { detail } from '../services/address'
import { sizeMap } from '../utils/map/order'
import { list } from '../services/address'
import { detail as orderDetail } from '../services/order'
import { add as addPortfolio, edit as editPortfolio } from '../services/portfolio'
import defaultModelList from '../package-main-order/pages/stageView/model'
import defaultPillowModelList from '../package-main-order/pages/stageView/pillowmodel'
import defaultMousePadModelList from '../package-main-order/pages/stageView/mousePadModel'

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

const initModelList = (modelList, imgList) => {
    return modelList.map((model) => {
        return {
            ...model,
            editArea: model.editArea.map((editArea, index) => {
                return {
                    ...editArea,
                    img: imgList[index]
                }
            })
        }
    })
}

const isEmptyAddress = () => {
    return list().then(({ data }) => {
        return data.data.length <= 0;
    })
}

const isExpire = (expireTime) => {
    if(!expireTime || (new Date()).getTime() > expireTime) {
        return true
    }
    return false;
}

export default {
    namespace: 'confirmOrder',
    state: {
        addressInfo: defaultAddressInfo, // 地址信息
        coupon: defaultCoupon, // 优惠券信息
        goodId: null, // 商品id
        portfolioId: null, // 作品集id
        userImageList: [], // 照片列表
        stageModelList: [],
        stageFileList: [],
        size: 5, // 照片尺寸 仅在普通照片有效
        proportion: 0.7, // 照片比例 仅在普通照片有效
        // 商品类型 枚举：/utils/map/product/productType
        type: 1,
        imgCache: {
            // [`id`]: {
            //     expireTime: null,
            //     list: []
            // }
        }
    },

    effects: {
        *pushSeletPage({ payload }, { put, call }) {
            const { goodInfo, portfolioId, userImageList, stageFileList, goConfirmOrder = false } = payload;

            yield put({
                type: 'saveGoodInfo',
                payload: goodInfo
            })

            yield put({
                type: 'savePortfolioId',
                payload: portfolioId || null
            })
            
            if(userImageList) {
                yield put({
                    type: 'saveUserImageList',
                    payload: userImageList || []
                })
            }
            

            let path = '';

            switch (goodInfo.category) {
                case 0:
                    const isEmpty = yield call(isEmptyAddress);
                    if (isEmpty) {
                        path = `/pages/addressEdit/index?type=add&redirect=${encodeURIComponent('/package-main-order/pages/confirmOrder/index')}`
                    } else {
                        path = `/package-main-order/pages/confirmOrder/index`
                    }
                    break;
                case 1:
                    path = `/package-main-order/pages/selectPic/index`
                    break;
                case 2:
                    path = `/package-main-order/pages/selectBook/index`
                    break;
                case 3:
                    path = `/package-main-order/pages/deskCalendar/index`
                    break;
                case 4:
                    yield put({
                        type: 'saveStageFileList',
                        payload: stageFileList
                    })
                    yield put({
                        type: 'saveStageModelList',
                        payload: initModelList(defaultModelList, stageFileList)
                    })
                    path = `/package-main-order/pages/stageView/index`
                    break;
                case 5:
                    yield put({
                        type: 'saveStageFileList',
                        payload: stageFileList
                    })
                    yield put({
                        type: 'saveStageModelList',
                        payload: initModelList(defaultPillowModelList, stageFileList)
                    })
                    path = `/package-main-order/pages/stageView/index`
                    break;
                case 6:
                    yield put({
                        type: 'saveStageFileList',
                        payload: stageFileList
                    })
                    yield put({
                        type: 'saveStageModelList',
                        payload: initModelList(defaultMousePadModelList, stageFileList)
                    })
                    path = `/package-main-order/pages/stageView/index`
                    break;
            }
            
            if (goConfirmOrder) {
                path = '/package-main-order/pages/confirmOrder/index'
            }

            if (process.env.TARO_ENV == 'h5') {
                return Taro.navigateTo({
                    url: path
                })
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
            try {
                if (payload.resultList) {
                    yield put({
                        type: 'saveUserImageList',
                        payload: payload.resultList
                    })
                }
                isEmptyAddress().then((isEmpty) => {
                    if (isEmpty) {
                        Taro.navigateTo({
                            url: `/pages/addressEdit/index?type=add&redirect=${encodeURIComponent('/package-main-order/pages/confirmOrder/index')}`
                        })
                    } else {
                        Taro.navigateTo({
                            url: '/package-main-order/pages/confirmOrder/index'
                        })
                    }
                })
            } catch (error) {
                console.error(error)
            }

        },
        *savePortfolio({ payload }, { call, put, select }) { // 存入作品集
            try {
                const { resultList } = payload;
                const { portfolioId, goodId } = yield select((state) => {
                    return state.confirmOrder;
                });
                if (portfolioId) {
                    const response = yield call(() => {
                        return new Promise((resolve, reject) => {
                            Taro.showModal({
                                title: '确认保存',
                                content: '将覆盖原作品，是否确认保存当前修改？',
                                confirmText: '确认',
                                cancelText: '取消',
                                confirmColor: '#FF6345',
                                success: (res) => {
                                    resolve(res)
                                }
                            })
                        })
                    })
                    if (response.confirm) {
                        yield call(editPortfolio, {
                            portfolioId: portfolioId,
                            userImageList: resultList
                        })
                        Taro.showToast({
                            title: '作品集保存成功',
                            icon: 'none',
                            duration: 1500
                        })
                    }
                    return;
                }
                const response = yield call(addPortfolio, {
                    goodId: goodId,
                    userImageList: resultList
                })

                if (response.data.data.portfolioId) {
                    Taro.showToast({
                        title: '已保存，可在作品集中查看',
                        icon: 'none',
                        duration: 2000
                    })
                    yield put({
                        type: 'savePortfolioId',
                        payload: response.data.data.portfolioId
                    })
                }
            } catch (error) {
                console.log(error)
            }
        },
        *getDetail({ payload }, { call, put, select }) {
            const response = yield call(orderDetail, {
                loanId: payload
            });
            if (response) {
                yield put({
                    type: 'saveUserImageList',
                    payload: response.data.data.goodsInfo[0].userImageList
                })
            }
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
        initUserImgList(state) {
            const isExpired = isExpire(state.imgCache?.[state.goodId]?.expireTime);
            const imgList = !isExpired ? (state.imgCache?.[state.goodId]?.list || []) : [];
            return {
                ...state,
                userImageList: imgList,
                imgCache: {
                    ...state.imgCache,
                    [state.goodId]: {
                        ...state.imgCache?.[state.goodId],
                        list: imgList
                    }
                }
            }
        },
        saveStageFileList(state, { payload }) {
            return {
                ...state,
                stageFileList: payload
            }
        },
        saveStageModelList(state, { payload }) {
            return {
                ...state,
                stageModelList: payload
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
        saveUserImageList(state, { payload, expireTime }) {
            if (Array.isArray(payload)) {
                return {
                    ...state,
                    userImageList: payload,
                    imgCache: {
                        ...state.imgCache,
                        [state.goodId]: {
                            list: payload,
                            expireTime: expireTime || state.imgCache?.[state.goodId]?.expireTime
                        }
                    }
                }
            } else {
                return {
                    ...state,
                    userImageList: [
                        ...state.userImageList,
                        payload
                    ],
                    imgCache: {
                        ...state.imgCache,
                        [state.goodId]: {
                            list: [
                                ...state.userImageList,
                                payload
                            ],
                            expireTime: expireTime || state.imgCache?.[state.goodId]?.expireTime
                        }
                    }
                }
            }
        },
        mutateUserImageList(state, { payload, expireTime }) {

            const { index, userImage } = payload;

            const cloneUserImageList = [...state.userImageList];

            if (index != -1) {
                cloneUserImageList[index] = userImage;
            } else {
                const emptyIndex = cloneUserImageList.findIndex((v) => {
                    return !v;
                });
                if (emptyIndex == -1) {
                    cloneUserImageList.push(userImage);
                } else {
                    cloneUserImageList[emptyIndex] = userImage;
                }
            }
            
            return {
                ...state,
                userImageList: cloneUserImageList,
                imgCache: {
                    ...state.imgCache,
                    [state.goodId]: {
                        list: cloneUserImageList,
                        expireTime: expireTime || state.imgCache?.[state.goodId]?.expireTime
                    }
                }
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
