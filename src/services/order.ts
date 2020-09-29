import TaroRequest from '../utils/request'

export const create = (data) => {
    return TaroRequest.request({
        url: `/loan/create`,
        method: 'POST',
        data
    })
}

export const list = (data) => {
    return TaroRequest.request({
        url: `/loan/list`,
        method: 'GET',
        data
    })
}

export const detail = (data) => {
    return TaroRequest.request({
        url: `/loan/detail`,
        method: 'GET',
        data
    })
}

export const repay = (data) => {
    return TaroRequest.request({
        url: `/loan/repay`,
        method: 'GET',
        data
    })
}

export const receipt = (data) => {
    return TaroRequest.request({
        url: `/loan/receipt`,
        method: 'GET',
        data
    })
}

export const cancel = (data) => {
    return TaroRequest.request({
        url: `/loan/cancel`,
        method: 'GET',
        data
    })
}

export const logistics = (data) => {
  return TaroRequest.request({
      url: `/loan/logistics`,
      method: 'GET',
      data
  })
}
