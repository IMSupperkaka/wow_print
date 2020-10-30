import TaroRequest from '../utils/request'

// 作品集列表
export const list = (params) => {
    return TaroRequest.request({
        url: `/portfolio/list`,
        method: 'GET',
        params
    })
}

// 作品集详情
export const detail = (params) => {
    return TaroRequest.request({
        url: `/portfolio/detail`,
        method: 'GET',
        params
    })
}

// 删除作品集
export const deleteWork = (id) => {
    return TaroRequest.request({
        url: `/portfolio/${id}`,
        method: 'GET'
    })
}

// 新增作品集
export const add = (data) => {
    return TaroRequest.request({
        url: `/portfolio`,
        method: 'POST',
        data
    })
}

// 修改作品集
export const edit = (data) => {
    return TaroRequest.request({
        url: `/portfolio`,
        method: 'PUT',
        data
    })
}