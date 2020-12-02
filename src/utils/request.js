import Taro from '@tarojs/taro'
import { store, app } from '../dva'

const tokeninterceptor = function (chain) {
    const requestParams = chain.requestParams;
    const { header } = requestParams;
    return chain.proceed({
        ...requestParams,
        header: {
            ...header,
            token: Taro.getStorageSync('token'),
            channel: Taro.getStorageSync('channel')
        }
    });
}

const getBaseUrl = () => {
    if (Taro.getEnv() == 'WEB') {
        return '/api';
    }
    return BASE_URL;
}

class TaroRequest {

    constructor() {
        Taro.addInterceptor(Taro.interceptors.logInterceptor);
        Taro.addInterceptor(tokeninterceptor);
        this.baseUrl = getBaseUrl();
        this.queue = [];
        this.isBlock = false;
        this.uploadToken = {
            expire: null,
            token: null
        }
    }

    blocking() {
        this.isBlock = true;
    }

    async uploadFile(params) {
        const nowStamp = new Date().getTime();
        if (!this.uploadToken.token || (nowStamp > this.uploadToken.expire)) {
            const response = await this.request({
                url: `/upload/getUploadToken`,
                method: 'GET'
            })
            this.uploadToken.token = response.data.data;
            this.uploadToken.expire = nowStamp + 60 * 1000;
        }
        return new Promise((resolve) => {
            Taro.uploadFile({
                url: 'https://up.qiniup.com',
                filePath: params.filePath,
                name: params.name,
                formData: {
                    token: this.uploadToken.token
                },
                success: function (res) {
                    const response = JSON.parse(res.data);
                    resolve({
                        data: `https://cdn.91jiekuan.com/${response.key}`
                    });
                }
            })
        })
    }

    async request(params) {

        const { dispatch } = app;

        const requestPromise = () => {
            return new Promise((resolve, reject) => {
                Taro.showLoading({
                    title: '请求数据中',
                    mask: true
                });
                Taro.request({
                    complete: (params) => {
                        if (params.data?.code != '10000') {
                            if (params.data?.code == '10025') {
                                if (process.env.TARO_ENV == 'h5') {
                                    if (location.pathname == '/pages/login/index') {
                                        return false;
                                    }
                                    return Taro.redirectTo({
                                        url: `/pages/login/index?redirect=${encodeURIComponent(location.pathname + location.search)}`
                                    })
                                }
                                return dispatch({
                                    type: 'user/login',
                                    payload: {
                                        success: () => {
                                            requestPromise().then(resolve);
                                        }
                                    }
                                })
                            }
                            Taro.showToast({
                                title: params.data?.msg || '服务器开小差了~',
                                icon: 'none'
                            });
                            return reject(params.data);
                        }
                        Taro.hideLoading();
                        resolve(params);
                    },
                    ...params,
                    url: this.baseUrl + params.url
                })
            })
        }

        return requestPromise();
    }
}

export default new TaroRequest();
