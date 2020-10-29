import React from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View } from '@tarojs/components';

const Base = (Page) => {
    return connect(({ user }) => ({
        user
    }))((props) => {
        if (!props.user.loadFinish) {
            return false;
        }
        return <Page/>;
    });
}

export default Base;
