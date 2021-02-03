/*
 * @Author: shawn.huashiyun 
 * @Date: 2020-12-14 19:47:38 
 * @Last Modified by: shawn.huashiyun
 * @Last Modified time: 2021-02-03 12:00:29
 * @Description 处理页面级组件的登录态 根据运行环境和url参数不同分别执行微信登录，联合登录，游客登录
 * @Description 为页面级组件注入路由信息
 * @Description 记录滚动位置
 * @Description 获取渠道配置(存入config.model)并在渠道变更时重新登录
 * @Description 根据路由参数save_dva在组件渲染前执行相应操作
 * @Todo 所有页面级组件都需要套接该装饰器
 */

import React, { useState, useEffect } from 'react';
import Taro, { useDidShow as _useDidShow } from '@tarojs/taro';
import { connect } from 'react-redux';
import UAParser from 'ua-parser-js';

import { useSaveScrollTop } from '@/hooks';
import { getSign } from '../services/user';
import { getRouterParams } from '../utils/utils';

let wx;

if (process.env.TARO_ENV === 'h5') {
    wx = require('weixin-js-sdk');
}

const buildAuthUrl = ({ appid, redirect_uri, response_type, scope, state }) => {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}&state=${state}`;
}

const Base = (Camp) => {
    return connect(({ user }) => ({
        user
    }))((props) => {

        const [finish, setFinish] = useState(false);
    
        const query = getRouterParams();

        useSaveScrollTop();

        useEffect(() => {

            if (query.channel) {
                const channel = Taro.getStorageSync('channel');
                props.dispatch({
                    type: 'config/changeChannel',
                    payload: query.channel
                })
                if (process.env.TARO_ENV === 'h5' && query.channel != channel) {
                    props.dispatch({
                        type: 'user/logout'
                    })
                }
            }

            if (process.env.TARO_ENV === 'h5') {

                const isWechatLogin = sessionStorage.getItem('wechatLogin');

                const token = Taro.getStorageSync('token');

                const phoneInfo = new UAParser().getResult();

                if (phoneInfo.browser.name == 'WeChat') { // 微信环境中且未获取授权
                    
                    if (!isWechatLogin) {
                        const authUrl = buildAuthUrl({
                            appid: 'wx7019f438ecf29a95',
                            response_type: 'code',
                            redirect_uri: encodeURIComponent(location.href),
                            scope: 'snsapi_userinfo'
                        })
                        sessionStorage.setItem('wechatLogin', 'yes');
                        return location.replace(authUrl);
                    }

                    if (query.code) { // 微信授权重定向后 请求微信内H5登录
                        return props.dispatch({
                            type: 'user/wechatLogin',
                            payload: {
                                code: query.code,
                                resolve: () => {
                                    setFinish(true);
                                }
                            }
                        })
                    }

                    return getSign({ // 获取wx jssdk config参数
                        url: location.href.split('#')[0]
                    }).then(({ data }) => {
                        wx.config({
                            debug: false,
                            appId: data.data.appId,
                            timestamp: data.data.timestamp,
                            nonceStr: data.data.noncestr,
                            signature: data.data.signature,
                            jsApiList: ['chooseWXPay']
                        });
                        setFinish(true);
                    })

                }

                if (query.save_dva) { // 微信H5支付后 新开safiri后url携带的参数 将会存入dva
                    const dvaData = JSON.parse(query.save_dva);
                    if (Array.isArray(dvaData)) {
                        dvaData.map((v) => {
                            props.dispatch({
                                type: v.type,
                                payload: v.payload
                            })
                        })
                    }
                }

                if (query.changeToken) { // 若url携带交换token 请求联合登录
                    return props.dispatch({
                        type: 'user/joinLogin',
                        payload: {
                            changeToken: query.changeToken,
                            resolve: () => {
                                setFinish(true);
                            }
                        }
                    })
                }

                if (!token) {
                    return props.dispatch({
                        type: 'user/touristsLogin',
                        payload: {
                            resolve: () => {
                                setFinish(true);
                            }
                        }
                    })
                }

                setFinish(true);
            }

        }, [])
        
        if (process.env.TARO_ENV === 'weapp') {
            return <Camp router={{ query: query }} {...props} />;
        }

        return finish ? <Camp router={{ query: query }} {...props} /> : null;
    })
}

export const useDidShow = (callback) => {

    useEffect(() => {
        callback();
    }, [])
    
    _useDidShow(callback);

}

export default Base;