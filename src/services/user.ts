/*
 * @Date: 2020-09-09 21:04:30
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 00:32:56
 * @FilePath: \wow_print\src\services\user.ts
 * @Description: Descrip Content
 */
import TaroRequest from '../utils/request'

export const login = (code) => {
    return TaroRequest.request({
        url: `/app/user/login/${code}`,
        method: 'POST'
    })
}

export const sms = (data) => {
    return TaroRequest.request({
        url: `/app/sms`,
        method: 'POST',
        data
    })
}

export const smsLogin = (data) => {
    return TaroRequest.request({
        url: `/h5/user/login`,
        method: 'POST',
        data
    })
}

export const saveinfo = (data) => {
    return TaroRequest.request({
        url: `/app/user/info`,
        method: 'POST',
        data
    })
}

export const info = () => {
    return TaroRequest.request({
        url: `/my/info`,
        method: 'GET'
    })
}
