import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const list = (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/goods/index/list`,
        method: 'GET'
    })
}
