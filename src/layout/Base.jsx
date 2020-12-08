import React, { useState, useEffect } from 'react';
import Taro, { useDidShow as _useDidShow } from '@tarojs/taro';
import { connect } from 'react-redux';

import { getRouterParams } from '../utils/utils';

const Base = (Camp) => {

    return connect(({ user }) => ({
        user
    }))((props) => {

        const [getChangeTokenDone, setGetChangeTokenDone] = useState(false);
    
        const query = getRouterParams();

        _useDidShow(() => {
            Base.didShow && Base.didShow();
        })

        useEffect(() => {

            if (process.env.TARO_ENV === 'h5') {

                const changeToken = sessionStorage.getItem('changeToken');
                
                if (query.channel) {
                    Taro.setStorageSync('channel', query.channel);
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
                            changeToken,
                            resolve: () => {
                                setGetChangeTokenDone(true);
                            }
                        }
                    })
                }

                setGetChangeTokenDone(true);
            }

        }, [])
        
        if (process.env.TARO_ENV === 'weapp') {
            return <Camp router={{ query: query }} {...props} />;
        }

        return getChangeTokenDone ? <Camp router={{ query: query }} {...props} /> : null;
    })
}

export const useDidShow = (callback) => {

    useEffect(() => {
        callback();
    }, [])
    
    Base.didShow = callback;
}

export default Base;