import Taro from '@tarojs/taro';
import { sessionStorage } from '../utils/storage';

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
