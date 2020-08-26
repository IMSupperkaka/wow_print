import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Image } from '@tarojs/components'

import './index.less'

@connect(({ user }) => ({
    user
}))
class Index extends Component {

    onGetUserInfo = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'user/saveUserInfo',
            payload: JSON.parse(e.detail.rawData)
        })
        Taro.navigateBack();
    }

    render() {
        return (
            <View className='index'>
                <Button openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>授权用户信息</Button>
            </View>
        )
    }
}

export default Index
