import React, { useState } from 'react';
import { View, Image, Text, Button } from '@tarojs/components';

import Modal from '../../components/Modal';

export const usePay = (props) => {

    const { onSuccess, onFail, onComplete } = props;

    const [visible, setVisible] = useState(false);
    const [money, setMoney] = useState(0);

    const openPay = ({ money }) => {
        if (process.env.TARO_ENV == 'weapp') {
            const response = props.confirmPay({
                payType: 'JSAPI'
            });
            if (response.then === 'function') {
                response.then(() => {
                    pay(response);
                })
            } else {
                pay(response);
            }
            return;
        }
        if (process.env.TARO_ENV == 'h5') {
            setVisible(true);
            setMoney(money);
        }
    }

    const pay = (response) => {
        if (process.env.TARO_ENV == 'weapp') {
            Taro.requestPayment({
                timeStamp: payData.timestamp,
                nonceStr: payData.nonce_str,
                package: payData.pay_package,
                signType: 'MD5',
                paySign: payData.paysign,
                success: onSuccess.bind(this, response),
                fail: onFail.bind(this, response),
                complete: onComplete.bind(this, response)
            })
        }
    }

    return {
        payProps: {
            visible,
            money,
            confirmPay: props.confirmPay
        },
        openPay,
        pay
    }
}

export default (props) => {

    const [payType, setPayType] = useState('wechat');

    const confirmPay = () => {
        const response = props.confirmPay({ payType });
    }

    return (
        <Modal visible={props.visible}>
            <View>请选择支付方式</View>
            <Button className="primary-btn" onClick={confirmPay}>确认支付</Button>
        </Modal>
    )
}
