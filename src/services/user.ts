import TaroRequest from '../utils/request'

export const login = (code) => {
    return TaroRequest.request({
        url: `/app/user/login/${code}`,
        method: 'POST'
    })
}

export const smsLogin = (data) => {
    return TaroRequest.request({
        url: `/h5/user/login`,
        method: 'POST',
        data
    })
}

export const saveinfo = (data) => {
    return TaroRequest.request({
        url: `/app/user/info`,
        method: 'POST',
        data
    })
}

export const info = () => {
    return TaroRequest.request({
        url: `/my/info`,
        method: 'GET'
    })
}
