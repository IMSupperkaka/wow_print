import Taro from '@tarojs/taro'

export default {
    namespace: 'editimg',
    state: {
        imgList: [],
        activeIndex: 0
    },
    effects: {
        *goEditImg({ payload }, { call, put }) {
            yield put({
                type: 'saveEditInfo',
                payload: {
                    imgList: payload.imgList,
                    activeIndex: payload.defaultIndex
                }
            });
            Taro.navigateTo({
                url: '/pages/imgEdit/index'
            })
        }
    },
    reducers: {
        saveEditInfo(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    }
}
