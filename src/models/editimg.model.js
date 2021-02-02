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
                url: '/package-main-order/pages/imgEdit/index'
            })
        },
        *deleteImg({ payload }, { put, select }) {
            const { imgList, activeIndex } = yield select((state) => {
                return state.editimg;
            })
            const { index } = payload;
            const cloneList = [...imgList];
            cloneList.splice(index, 1);

            if (cloneList.length <= 0) {
                Taro.navigateBack();
            }

            yield put({
                type: 'saveActiveIndex',
                payload: activeIndex >= cloneList.length ? (cloneList.length - 1) : activeIndex
            })

            yield put({
                type: 'saveImgList',
                payload: cloneList
            })

            Taro.eventCenter.trigger('editFinish', cloneList);
        }
    },
    reducers: {
        saveEditInfo(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        },
        saveImgList(state, { payload }) {
            return {
                ...state,
                imgList: payload
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
