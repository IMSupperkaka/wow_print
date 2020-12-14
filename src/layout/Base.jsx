import React, { useState, useEffect } from 'react';
import Taro, { useDidShow as _useDidShow } from '@tarojs/taro';
import { connect } from 'react-redux';
import UAParser from 'ua-parser-js';

import { getSign } from '../services/user';
import { getRouterParams } from '../utils/utils';

const buildAuthUrl = ({ appid, redirect_uri, response_type, scope, state }) => {
    return authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}&state=${state}`;
}

const Base = (Camp) => {

    return connect(({ user }) => ({
        user
    }))((props) => {

        const [finish, setFinish] = useState(false);
    
        const query = getRouterParams();

        _useDidShow(() => {
            Base.didShow && Base.didShow();
        })

        useEffect(() => {

            if (process.env.TARO_ENV === 'h5') {

                // import wx from 'weixin-js-sdk';

                if (query.channel) {
                    Taro.setStorageSync('channel', query.channel);
                }

                const changeToken = sessionStorage.getItem('changeToken');
                
                const isWechatLogin = sessionStorage.getItem('wechatLogin');

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

                    if (query.code) {
                        return props.dispatch({
                            type: 'user/wechatLogin',
                            payload: {
                                code: query.code,
                                resolve: () => {
                                    Taro.redirectTo({
                                        url: 'pages/home/index'
                                    })
                                }
                            }
                        })
                    }

                    return getSign({
                        url: location.href
                    }).then(({ data }) => {
                        wx.config({
                            debug: true,
                            appId: data.data.appId,
                            timestamp: data.data.timestamp,
                            nonceStr: data.data.nonceStr,
                            signature: data.data.signature,
                            jsApiList: ['chooseWXPay']
                        });
                        setFinish(true);
                    })

                }

                if (query.save_dva) {
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

                if (query.changeToken && changeToken != query.changeToken) {
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
    
    Base.didShow = callback;
}

export default Base;