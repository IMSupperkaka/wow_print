import Taro from '@tarojs/taro'

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

class TaroRequest {

    constructor() {
        Taro.addInterceptor(Taro.interceptors.logInterceptor);
        Taro.addInterceptor(tokeninterceptor);
    }

    uploadFile(params) {
        return new Promise((resolve) => {
            const uploadTask = Taro.uploadFile({
                url: params.url,
                filePath: params.filePath,
                name: params.name,
                header: {
                    token: Taro.getStorageSync('token')
                },
                formData: params.formData,
                success: function (res){
                    resolve(JSON.parse(res.data));
                }
            })
            uploadTask.progress(params.progress);
        })
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
                            title: params.data.msg || '服务器开小差了~',
                            icon: 'none'
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
