import TaroRequest from '../utils/request'

export const list = (code) => {
    return TaroRequest.request({
        url: `/address/list`,
        method: 'GET'
    })
}

export const detail = (data) => {
    return TaroRequest.request({
        url: `/address/detail`,
        method: 'GET',
        data
    })
}

export const add = (data) => {
    return TaroRequest.request({
        url: `/address`,
        method: 'POST',
        data
    })
}

export const edit = (data) => {
    return TaroRequest.request({
        url: `/address`,
        method: 'PUT',
        data
    })
}

export const del = (id) => {
    return TaroRequest.request({
        url: `/address/${id}`,
        method: 'DELETE'
    })
}

// 待付款订单修改地址
export const change = (data) => {
    return TaroRequest.request({
        url: `/loan/changeAddress`,
        method: 'GET',
        data
    })
}
