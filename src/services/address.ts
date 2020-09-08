import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const list = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/address/list`,
        method: 'GET'
    })
}

export const add = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/address`,
        method: 'POST'
    })
}

export const edit = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/address`,
        method: 'PUT'
    })
}

export const del = (id) => {
    return TaroRequest.request({
        url: `${baseUrl}/address/${id}`,
        method: 'DELETE'
    })
}
