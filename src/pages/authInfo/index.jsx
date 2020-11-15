import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import { connect } from 'react-redux'
import { View, Image, Text } from '@tarojs/components'

import styles from './index.module.less'
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
                    const query = Taro.getCurrentInstance().router.params;
                    if (query.redirect) {
                        Taro.redirectTo({
                            url: query.redirect
                        })
                    } else {
                        Taro.navigateBack();
                    }
                }
            }
        })
    }

    goBack = () => {
        Taro.navigateBack();
    }

    handleGoService = () => {
        const url = encodeURIComponent(`${BASE_WEB_URL}/agreement.html\?key=user_service_agreement`);
        Taro.navigateTo({
            url: `/pages/webview/index?url=${url}`
        })
    }

    handleGoPolicy = () => {
        const url = encodeURIComponent(`${BASE_WEB_URL}/agreement.html\?key=privacy_service_agreement`);
        Taro.navigateTo({
            url: `/pages/webview/index?url=${url}`
        })
    }

    handleLogin = () => {
      const { dispatch } = this.props;
      if (process.env.TARO_ENV == 'h5') {
        dispatch({
            type: 'user/saveUserInfo',
            payload: {
                token: 'AUTH_USER_1_4038a51297e742ddbf979a16ce98c9e5'
            }
        })
        const query = Taro.getCurrentInstance().router.params;
        if (query?.redirect) {
            Taro.redirectTo({
                url: query.redirect
            })
        } else {
            Taro.navigateBack();
        }
      }
    }

    render() {
        return (
            <View className={styles.index}>
                <Image src={logo} className={styles.logo}/>
                <AtButton onClick={this.handleLogin} className={styles['auth-btn']} type='primary' openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>微信授权登录</AtButton>
                <AtButton className={styles['cancel-btn']} onClick={this.goBack} type='primary'>取消</AtButton>
                <View className={styles['bottom-agreement']}>
                    登陆视为同意
                    <Text onClick={this.handleGoService}>《用户服务协议》</Text>
                    和
                    <Text onClick={this.handleGoPolicy}>《隐私权政策》</Text>
                </View>
            </View>
        )
    }
}

export default Index
