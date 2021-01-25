/*
 * @Date: 2020-09-09 21:04:30
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 01:10:03
 * @FilePath: \wow_print\src\models\config.models.js
 * @Description: Descrip Content
 */

import { channelConfig } from '../services/config';
import Taro from '@tarojs/taro';

export default {
    namespace: 'config',
    state: {
        channel: 'wayin',
        config: {
            payMethods: [
                "alipay",
                "wechatpay"
            ]
        }
    },
    effects: {
        *changeChannel({ payload }, { put, select, call }) {
            yield put({
                type: 'setChannel',
                payload: payload
            })
            const reponse = yield call(channelConfig, payload);
            yield put({
                type: 'setConfig',
                payload: reponse.data.data
            })
        }
    },
    reducers: {
        setChannel(state, { payload }) {
            Taro.setStorageSync('channel', payload);
            return {
                ...state,
                channel: payload
            }
        },
        setConfig(state, { payload }) {
            return {
                ...state,
                config: {
                    ...state.config,
                    ...payload
                }
            }
        }
    }
}
