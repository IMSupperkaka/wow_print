import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Text, Image, Button, Form, Input } from '@tarojs/components';

import useCaptcha from '../../hooks/useCaptcha';
import styles from './index.module.less';
import { smsLogin, sms } from '../../services/user';

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

const Login = ({ dispatch }) => {

    const phoneRef = useRef();

    const { loading, time, captcha } = useCaptcha({
        captchaId: '0cb21f30fc9b487ab31e55c5243fd299',
        onVerify: (data) => {
            return sms({
                ...data,
                phone: phoneRef.current.value
            }).then(() => {
                Taro.showToast({
                    title: '发送成功',
                    icon: 'none',
                    duration: 1500
                });
            })
        }
    });

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
        dispatch({
            type: 'user/smsLogin',
            payload: formData
        })
    }

    const getCode = () => {
        if (time != 60) {
            return false;
        }
        if (!/^[1-9][0-9]{10}$/.test(phoneRef.current.value)) {
            Taro.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 1500
            });
            return false;
        }
        captcha.verify();
    }

    const getCodeText = time == 60 ? '获取验证码' : `${time}秒后重试`;

    return (
        <View className={styles['page']}>
            <Image className={styles['login-logo']} />
            <View className={styles['login-title']}>欢迎登陆哇印</View>
            <Form onSubmit={formSubmit}>
                <View className={styles['login-form']}>
                    <Input ref={phoneRef} type='number' maxLength='10' name='phone' placeholder="输入手机号" className={classnames(styles['login-input'], 'wy-hairline--bottom')} />
                    <Input type='number' maxLength='4' name='code' placeholder="输入验证码" className={classnames(styles['login-input'], 'wy-hairline--bottom')} />
                    <Button className={classnames(styles['getcode-btn'], 'radius-btn', 'primary-outline-btn')} onClick={getCode}>
                        {getCodeText}
                    </Button>
                </View>
                <Button formType="submit" className={classnames('radius-btn', 'primary-btn', styles['login-btn'])}>确认登录</Button>
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

export default connect(({ user }) => ({
    user
}))(Login)
