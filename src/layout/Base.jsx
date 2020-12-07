import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';

import { getH5Params } from '../utils/utils';
import { changeToken as getChangeToken } from '../services/user';

const Base = (Camp) => {

    return connect(({ user }) => ({
        user
    }))((props) => {

        const [getChangeTokenDone, setGetChangeTokenDone] = useState(false);
    
        useEffect(() => {
            props.dispatch({
                type: 'user/joinLogin',
                payload: {
                    resolve: () => {
                        setGetChangeTokenDone(true);
                    }
                }
            })
        }, [])
    
        if (process.env.TARO_ENV === 'weapp') {
            return <Camp {...props} />;
        }
    
        return getChangeTokenDone ? <Camp {...props} /> : null;
    })
}

export default Base;