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

const initImg = (imginfo, content) => {
    const cloneImginfo = {...imginfo};
    const aspectRadio = imginfo.width / imginfo.height;
    const contentRadio = content.width / content.height;
    if (aspectRadio > 1) {
        const deg = 1.5 * Math.PI;
        cloneImginfo.rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
        if (1 / aspectRadio > contentRadio) {
            cloneImginfo.fWidth = content.height;
            cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
        } else {
            cloneImginfo.fHeight = content.width;
            cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
        }
    } else {
        if (aspectRadio > contentRadio) {
            cloneImginfo.fHeight = content.height;
            cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
        } else {
            cloneImginfo.fWidth = content.width;
            cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
        }
        cloneImginfo.rotateMatrix = math.matrix([[Math.cos(0), Math.sin(0), 0], [-Math.sin(0), Math.cos(0), 0], [0, 0, 1]]);
    }
    cloneImginfo.translateMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    cloneImginfo.scaleMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    const centerPoint = [content.width / 2, content.height / 2, 1];
    const afterCenterPoint = [cloneImginfo.fWidth / 2, cloneImginfo.fHeight / 2, 1];
    const centerOffset = [centerPoint[0] - afterCenterPoint[0], centerPoint[1] - afterCenterPoint[1]];
    const radio = 750 / Taro.getSystemInfoSync().screenWidth;
    cloneImginfo.centerMatrix = math.matrix([[1, 0, centerOffset[0] / radio], [0, 1, centerOffset[1] / radio], [0, 0, 1]]);
    return cloneImginfo;
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
                            translate: [0, 0]
                        }
                        resolve({
                            originPath: filePath,
                            originImage: res.data,
                            cropImage: computeCropUrl(res.data, { ...imgInfo, contentWidth: 582, contentHeight: 582 / 0.7 }),
                            printNums: 1,
                            imgInfo: initImg(imgInfo, { width: 582, height: 582 / 0.7 })
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
