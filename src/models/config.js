/*
 * @Date: 2020-09-09 21:04:30
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 01:10:03
 * @FilePath: \wow_print\src\models\config.models.js
 * @Description: Descrip Content
 */

import { channelConfig } from '../services/config';

export default {
    namespace: 'config',
    state: {
        channel: null,
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
