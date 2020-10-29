import React from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View } from '@tarojs/components';

const Base = (Page) => {
    return connect(({ user }) => ({
        user
    }))((props) => {
        console.log('channel');
        console.log(Taro.getStorageSync('channel'));
        if (!props.user.loadFinish) {
            return <View>Loading</View>;
        }
        return <Page/>;
    });
}

export default Base;
