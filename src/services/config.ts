import TaroRequest from '../utils/request'

// 获取渠道配置
export const channelConfig = (channelName) => {
    return TaroRequest.request({
        url: `/app/channel/config/${channelName}`,
        method: 'GET'
    })
}
