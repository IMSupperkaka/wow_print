import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import { connect } from 'react-redux'
import { View, Image } from '@tarojs/components'

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

    goBack = () => {
        Taro.navigateBack();
    }

    render() {
        return (
            <View className='index'>
                <AtButton className="auth-btn" type='primary' openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>微信授权登录</AtButton>
                <AtButton className="cancel-btn" onClick={this.goBack} type='primary'>取消</AtButton>
            </View>
        )
    }
}

export default Index
