import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const login = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/app/user/login/${code}`,
        method: 'POST'
    })
}

export const saveinfo = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/app/user/info`,
        method: 'POST',
        data
    })
}

export const info = () => {
    return TaroRequest.request({
        url: `${baseUrl}/my/info`,
        method: 'GET'
    })
}
