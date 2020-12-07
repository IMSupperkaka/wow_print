import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';

import { getH5Params } from '../utils/utils';
import { changeToken as getChangeToken } from '../services/user';

const Base = (props) => {

    const [token, setToken] = useState(false);

    useEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            const query = getH5Params(location.href);
            const changeToken = sessionStorage.getItem('changeToken');
            if(Taro.getStorageSync('token')) {
                sessionStorage.setItem('show_flag', true);
            }
            if (query.channel) {
                Taro.setStorageSync('channel', query.channel);
            }
            if (query.changeToken && changeToken != query.changeToken && !token) {
                return getChangeToken({
                    changeToken: query.changeToken,
                    disabledError: true
                }).then((res) => {
                    sessionStorage.setItem('changeToken', query.changeToken);
                    setToken(true)
                }).catch(() => {
                    sessionStorage.setItem('changeToken', query.changeToken);
                    setToken(true)
                })
            }
            setToken(true)
        }
    }, [])

    if (process.env.TARO_ENV === 'weapp') {
        return props.children;
    }

    return token ? props.children : null;
}

export default connect(({ user }) => ({
    user
}))(Base);