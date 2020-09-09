import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const list = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/address/list`,
        method: 'GET'
    })
}

export const detail = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/address/detail`,
        method: 'GET',
        data
    })
}

export const add = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/address`,
        method: 'POST',
        data
    })
}

export const edit = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/address`,
        method: 'PUT',
        data
    })
}

export const del = (id) => {
    return TaroRequest.request({
        url: `${baseUrl}/address/${id}`,
        method: 'DELETE'
    })
}
