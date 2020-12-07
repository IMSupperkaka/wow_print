import Taro from '@tarojs/taro';

const defaultPayInfo = JSON.parse(sessionStorage.getItem('pay-info') || '{}');

export default {
    namespace: 'pay',
    state: {
        payInfo: defaultPayInfo
    },
    reducers: {
        savePayInfo(state, { payload }) {

            sessionStorage.setItem('pay-info', payload);

            return {
                ...state,
                savePayInfo: payload
            }
        }
    }
}
