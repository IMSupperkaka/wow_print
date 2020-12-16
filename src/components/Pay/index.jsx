import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import UAParser from 'ua-parser-js';
import { View, Image, Text, Button } from '@tarojs/components';

let wx;

if (process.env.TARO_ENV === 'h5') {
    wx = require('weixin-js-sdk');
}

import styles from './index.module.less';
import Modal from '../../components/Modal';
import Radio from '../../components/Radio';
import { appendHTML } from '../../utils/dom';
import { getOrderStatus } from '../../services/order';
import closeIcon from '../../../images/fabu-delete3@2x.png';
import aliPayIcon from '../../../images/icon_alipay@2x.png';
import wechatPayIcon from '../../../images/icon_wechat pay@2x.png';

export const formSubmit = (url) => {
    let form = document.createElement("form");
    form.action = url;
    form.method = 'post';
    document.body.appendChild(form);
    form.submit();
}

const usePay = (props) => {

    const { onSuccess, onFail, onComplete } = props;

    const [visible, setVisible] = useState(false);
    const [money, setMoney] = useState(0);
    const [params, setParams] = useState({});

    useEffect(() => {

        if (process.env.TARO_ENV != 'h5') {
            return;
        }

        const payInfo = JSON.parse(sessionStorage.getItem('pay-info') || '{}')

        if (payInfo.payData) {

            setMoney(payInfo.money);

            setParams(payInfo.params);

            Taro.showModal({
                title: '支付确认',
                content: '如果您已完成支付，请点击支付完成',
                confirmText: '重新支付',
                cancelText: '支付完成',
                confirmColor: '#FF6345',
                cancelColor: '#333333',
                success: (res) => {
                    sessionStorage.removeItem('pay-info');
                    if (res.cancel) {
                        getOrderStatus(payInfo.payData.out_trade_no).then(({ data }) => {
                            if (data.data.isPay) {
                                onSuccess(payInfo);
                            } else {
                                onFail(payInfo);
                            }
                        })
                    } else {
                        setVisible(true);
                    }
                }
            })
        }

    }, [])

    const confirmPay = ({ payType, params: defaultParams }) => {
        const response = props.confirmPay({
            payType,
            params: defaultParams || params
        });
        if (typeof response.then === 'function') {
            response.then((res) => {
                pay({
                    response: res,
                    payType,
                    params: defaultParams || params
                });
            })
        } else {
            pay({
                response,
                payType,
                params: defaultParams || params
            });
        }
    }

    const openPay = (params) => {

        const { money } = params;

        setParams(params);

        if (process.env.TARO_ENV == 'weapp') {
            confirmPay({
                payType: 'JSAPI',
                params: params
            });
        }

        if (process.env.TARO_ENV == 'h5') {
            const phoneInfo = new UAParser().getResult();
            if (phoneInfo.browser.name == 'WeChat') {
                confirmPay({
                    payType: 'HJSAPI',
                    params: params
                });
            } else {
                setVisible(true);
                setMoney(money);
            }
        }
    }

    const pay = ({ response, payType, params }) => {

        const payData = response.payData;

        const payInfo = {
            response,
            params
        }

        if (process.env.TARO_ENV === 'weapp') {
            Taro.requestPayment({
                timeStamp: payData.timestamp,
                nonceStr: payData.nonce_str,
                package: payData.pay_package,
                signType: 'MD5',
                paySign: payData.paysign,
                success: onSuccess?.bind(this, payInfo),
                fail: onFail?.bind(this, payInfo),
                complete: onComplete?.bind(this, payInfo)
            })
        }

        if (process.env.TARO_ENV === 'h5') {
            if (payType === 'WAP') { // 支付宝H5支付
                try {
                    document.querySelector('body').removeChild(document.querySelector('[name=punchout_form]'));
                } catch (error) {
                    console.log(error);
                }
                appendHTML(document.querySelector('body'), payData);
                document.querySelector('[name=punchout_form]').submit();
            } else if (payType === 'MWEB') { // 微信H5支付
                const payInfo = JSON.stringify({
                    payData: payData,
                    payType: 'MWEB',
                    response: response,
                    params,
                    money
                })
                sessionStorage.setItem('pay-info', payInfo)
                const saveDva = [
                    {
                        type: 'pay/savePayInfo',
                        payload: payInfo
                    },
                    {
                        type: 'user/saveToken',
                        payload: Taro.getStorageSync('token')
                    }
                ]
                const redirect_url = `${location.protocol}//${location.host}/pages/orderDetail/index?id=${response.loanId}&save_dva=${encodeURIComponent(JSON.stringify(saveDva))}`
                const submitUrl = payData.mweb_url + `&redirect_url=${encodeURIComponent(redirect_url)}`;
                formSubmit(submitUrl);
            } else if (payType === 'HJSAPI') { // 微信内jsapi支付
                wx.chooseWXPay({
                    timestamp: payData.timestamp,
                    nonceStr: payData.nonce_str,
                    package: payData.pay_package,
                    signType: 'MD5',
                    paySign: payData.paysign,
                    success: (res) => {
                        onSuccess(payInfo)
                    },
                    fail: () => {
                        onFail(payInfo)
                    },
                    cancel: () => {
                        onFail(payInfo)
                    }
                });
            }
        }
    }

    return {
        payProps: {
            visible,
            onClose: () => {
                setVisible(false);
            },
            money,
            confirmPay
        },
        params,
        openPay,
        pay
    }
}
const Pay = (props) => {

    const { visible, money, confirmPay, onClose } = props;

    const [payType, setPayType] = useState('wechat');

    const handleConfirm = () => {
        let payMethod;
        if (payType == 'wechat') {
            if (process.env.TARO_ENV == 'h5') {
                payMethod = 'MWEB';
            } else {
                payMethod = 'JSAPI';
            }
        }
        if (payType == 'alipay') {
            payMethod = 'WAP';
        }
        confirmPay({
            payType: payMethod
        });
    }

    return (
        <Modal visible={visible} onClose={onClose}>
            <View className={classnames(styles['title'], 'wy-hairline--bottom')}>
                请选择支付方式
                <Image src={closeIcon} className={styles['close']} onClick={onClose}/>
            </View>
            <View className={styles['money-wrap']}>
                ¥<Text className={styles['money']}>{ money }</Text>
            </View>
            <Radio.Group value={payType} onChange={(value) => {
                setPayType(value)
            }}>
                <View className={classnames('wy-hairline--bottom', styles['paytype-box'])}>
                    <View className={styles['pay-title']}>
                        <Image src={wechatPayIcon} className={styles['pay-icon']}/>
                        <Text>微信支付</Text>
                    </View>
                    <Radio value="wechat"/>
                </View>
                <View className={classnames('wy-hairline--bottom', styles['paytype-box'])}>
                    <View className={styles['pay-title']}>
                        <Image src={aliPayIcon} className={styles['pay-icon']}/>
                        <Text>支付宝支付</Text>
                    </View>
                    <Radio value="alipay"/>
                </View>
            </Radio.Group>
            <Button className={classnames('primary-btn', styles['confirm-btn'])} onClick={handleConfirm}>确认支付</Button>
        </Modal>
    )
}

Pay.usePay = usePay;

export default Pay;
