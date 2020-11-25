import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, Form, Input } from '@tarojs/components';

import styles from './index.module.less';
import { smsLogin } from '../../services/user';

const handleGoService = () => {
    const url = encodeURIComponent(`${BASE_WEB_URL}/agreement.html\?key=user_service_agreement`);
    Taro.navigateTo({
        url: `/pages/webview/index?url=${url}`
    })
}

const handleGoPolicy = () => {
    const url = encodeURIComponent(`${BASE_WEB_URL}/agreement.html\?key=privacy_service_agreement`);
    Taro.navigateTo({
        url: `/pages/webview/index?url=${url}`
    })
}

export default () => {

    const formSubmit = (e) => {
        e.preventDefault();
        const formData = e.detail.value;
        if (!/^[1-9][0-9]{10}$/.test(formData.phone)) {
            return Taro.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 1500
            });
        }
        if (!/^[0-9]{4}$/.test(formData.code)) {
            return Taro.showToast({
                title: '请输入正确的验证码',
                icon: 'none',
                duration: 1500
            });
        }
        smsLogin(formData);
    }

    return (
        <View className={styles['page']}>
            <Image className={styles['login-logo']}/>
            <View className={styles['login-title']}>欢迎登陆哇印</View>
            <Form onSubmit={formSubmit}>
                <View className={styles['login-form']}>
                    <Input type='number' maxLength='10' name='phone' placeholder="输入手机号" className={classnames(styles['login-input'], 'wy-hairline--bottom')}/>
                    <Input type='number' maxLength='4' name='code' placeholder="输入验证码" className={classnames(styles['login-input'], 'wy-hairline--bottom')}/>
                </View>
                <Button formType="submit" className={classnames('radius-btn','primary-btn', styles['login-btn'])}>确认登录</Button>
            </Form>
            <View className={styles['bottom-agreement']}>
                登陆视为同意
                <Text onClick={handleGoService}>《用户服务协议》</Text>
                和
                <Text onClick={handleGoPolicy}>《隐私权政策》</Text>
            </View>
        </View>
    )
}