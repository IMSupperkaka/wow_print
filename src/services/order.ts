import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const create = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/create`,
        method: 'POST',
        data
    })
}

export const list = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/list`,
        method: 'GET',
        data
    })
}

export const detail = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/detail`,
        method: 'GET',
        data
    })
}

export const repay = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/repay`,
        method: 'GET',
        data
    })
}

export const receipt = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/receipt`,
        method: 'GET',
        data
    })
}

export const cancel = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/loan/cancel`,
        method: 'GET',
        data
    })
}
