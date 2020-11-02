import Taro from '@tarojs/taro'

import { detail } from '../services/address'
import { sizeMap } from '../utils/map/order'
import { list } from '../services/address'
import { add as addPortfolio, edit as editPortfolio } from '../services/portfolio'

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
    addressInfo: defaultAddressInfo, // 地址信息
    coupon: defaultCoupon, // 优惠券信息
    goodId: null, // 商品id
    portfolioId: null, // 作品集id
    userImageList: [], // 照片列表
    size: 5, // 照片尺寸 仅在普通照片有效
    proportion: 0.7, // 照片比例 仅在普通照片有效
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
        payload: payload.resultList
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
    },
    *savePortfolio({ payload }, { call, put, select }) { // 存入作品集
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
          title: '作品集保存成功',
          icon: 'none',
          duration: 2000
        })
        yield put({
          type: 'savePortfolioId',
          payload: response.data.data.portfolioId
        })
      } else {
        Taro.showModal({
          title: '提示',
          content: '作品集已满，请清除过多的作品~',
          confirmText: '去清除',
          cancelText: '取消',
          confirmColor: '#FF6345',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/portfolio/index'
              })
            }
          }
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
    mutateUserImageList(state, { payload }) {

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
        userImageList: cloneUserImageList
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
