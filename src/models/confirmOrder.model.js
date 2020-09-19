import Taro from '@tarojs/taro'

import { detail } from '../services/address'

export default {
  namespace: 'confirmOrder',
  state: {
    addressInfo: {
      id: null,
      recipient: null,
      phone: null,
      province: null,
      city: null,
      area: null,
      address: null
    },
    coupon: {
      id: null,
      couponFreeNums: 0
    },
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
    }
  },
  reducers: {
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
      return {
        ...state,
        userImageList: payload
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
