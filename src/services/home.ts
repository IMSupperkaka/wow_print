import TaroRequest from '../utils/request'

export const index = (code) => {
    return TaroRequest.request({
        url: `/index`,
        method: 'GET'
    })
}

export const judge = () => {
    return TaroRequest.request({
        url: `/coupon/index/judge`,
        method: 'GET'
    })
}

export const popup = () => {
    return TaroRequest.request({
        url: `/index/popups/list`,
        method: 'GET'
    })
}


export const list = (code) => {
    return TaroRequest.request({
        url: `/goods/index/list`,
        method: 'GET'
    })
}
