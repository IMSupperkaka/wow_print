import TaroRequest from '../utils/request'

// 作品集列表
export const list = (params) => {
    return TaroRequest.request({
        url: `/portfolio/list`,
        method: 'GET',
        params
    })
}
