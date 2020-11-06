import TaroRequest from '../utils/request'

export const list = (data) => {
    return TaroRequest.request({
        url: `/coupon/list`,
        method: 'GET',
        data
    })
}

export const pre = (data) => {
    return TaroRequest.request({
        url: `/coupon/use/pre`,
        method: 'GET',
        data
    })
}

// 领取优惠券
export const receive = () => {
    return TaroRequest.request({
        url: `/coupon/index/receive`,
        method: 'GET'
    })
}

// 渠道优惠券列表
export const channelCouponList = () => {
    return TaroRequest.request({
        url: `/coupon/channel/list`,
        method: 'GET'
    })
}
