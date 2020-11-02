/*
 * @Date: 2020-09-13 12:01:42
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-01 18:36:07
 * @FilePath: \wow_print\src\services\product.ts
 * @Description: Descrip Content
 */
import TaroRequest from '../utils/request'

export const list = (code) => {
  return TaroRequest.request({
      url: `/goods/index/list`,
      method: 'GET'
  })
}

export const detail = (data) => {
    return TaroRequest.request({
        url: `/goods/detail`,
        method: 'GET',
        data
    })
}

export const getMatchList = (data) => {
  return TaroRequest.request({
      url: `/goods/match`,
      method: 'GET',
      data
  })
}
