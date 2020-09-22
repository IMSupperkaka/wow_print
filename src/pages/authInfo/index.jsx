import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import { connect } from 'react-redux'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import logo from '../../../images/auth-logo@2x.png'

@connect(({ user }) => ({
    user
}))
class Index extends Component {

    onGetUserInfo = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'user/saveinfo',
            payload: {
                info: JSON.parse(e.detail.rawData),
                success: () => {
                    Taro.navigateBack();
                }
            }
        })
    }

    goBack = () => {
        Taro.navigateBack();
    }

    render() {
        return (
            <View className='index'>
                <Image src={logo} className="logo"/>
                <AtButton className="auth-btn" type='primary' openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>微信授权登录</AtButton>
                <AtButton className="cancel-btn" onClick={this.goBack} type='primary'>取消</AtButton>
                <View className="bottom-agreement">
                    登陆视为同意
                    <Text>《用户服务协议》</Text>
                    和
                    <Text>《隐私权政策》</Text>
                </View>
            </View>
        )
    }
}

export default Index
