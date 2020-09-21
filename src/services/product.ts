import TaroRequest from '../utils/request'

export const detail = (data) => {
    return TaroRequest.request({
        url: `/goods/detail`,
        method: 'GET',
        data
    })
}
