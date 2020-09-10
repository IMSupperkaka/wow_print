import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const detail = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/goods/detail`,
        method: 'GET',
        data
    })
}
