import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const index = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/index`,
        method: 'GET'
    })
}

export const judge = () => {
    return TaroRequest.request({
        url: `${baseUrl}/coupon/index/judge`,
        method: 'GET'
    })
}

export const popup = () => {
    return TaroRequest.request({
        url: `${baseUrl}/index/popups/list`,
        method: 'GET'
    })
}


export const list = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/goods/index/list`,
        method: 'GET'
    })
}
