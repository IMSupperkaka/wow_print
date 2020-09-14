import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const list = (data) => {
    return TaroRequest.request({
        url: `${baseUrl}/coupon/list`,
        method: 'GET',
        data
    })
}

// 领取优惠券
export const receive = () => {
    return TaroRequest.request({
        url: `${baseUrl}/coupon/index/receive`,
        method: 'GET'
    })
}
