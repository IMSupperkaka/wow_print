import Taro from '@tarojs/taro'
import { resolve } from 'path';

const tokeninterceptor = function (chain) {
    const requestParams = chain.requestParams;
    const { header } = requestParams;

    return chain.proceed({
        ...requestParams,
        header: {
            ...header,
            token: Taro.getStorageSync('token')
        }
    });
}

class TaroRequest {

    constructor() {
        Taro.addInterceptor(Taro.interceptors.logInterceptor);
        Taro.addInterceptor(tokeninterceptor);
    }

    request(params) {
        return new Promise((resolve) => {
            Taro.showLoading({
                title: '请求数据中',
                mask: true
            });
            Taro.request({
                complete: (params) => {
                    Taro.hideLoading();
                    resolve(params);
                },
                ...params
            })
        })
    }
}

export default new TaroRequest();
