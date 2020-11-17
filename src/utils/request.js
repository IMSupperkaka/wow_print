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
    }

    blocking() {
        this.isBlock = true;
    }

    uploadFile(params) {
        return new Promise((resolve) => {
            this.request({
                url: `/upload/getUploadToken`,
                method: 'GET'
            }).then(({ data }) => {
                const uploadTask = Taro.uploadFile({
                    url: 'https://up.qiniup.com',
                    filePath: params.filePath,
                    name: params.name,
                    header: {
                        "Content-Type": "multipart/form-data"
                    },
                    formData: {
                        token: data.data
                    },
                    success: function (res){
                        const response = JSON.parse(res.data);
                        resolve({
                            data: `https://cdn.91jiekuan.com/${response.key}`
                        });
                    }
                })
                uploadTask.progress(params.progress);
            })
        })
    }

    request(params) {

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
                                  return Taro.navigateTo({
                                    url: `/pages/authInfo/index`
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
                        setTimeout(() => { // 防止多个请求闪烁
                            Taro.hideLoading();
                        }, 0)
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
