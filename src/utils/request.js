import Taro from '@tarojs/taro'
import { resolve } from 'path';
import { rejects } from 'assert';

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
        return new Promise((resolve, reject) => {
            Taro.showLoading({
                title: '请求数据中',
                mask: true
            });
            Taro.request({
                complete: (params) => {
                    Taro.hideLoading();
                    if (params.data.code != '10000') {
                        Taro.showToast({
                            title: params.data.msg || '服务器开小差了~'
                        });
                        return reject(params.data);
                    }
                    resolve(params);
                },
                ...params
            })
        })
    }
}

export default new TaroRequest();
