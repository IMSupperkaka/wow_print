import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { View, Image, Text, Button } from '@tarojs/components';

import styles from './index.module.less';
import Modal from '../../components/Modal';
import Radio from '../../components/Radio';
import { appendHTML } from '../../utils/dom';
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

    const confirmPay = ({ payType, params }) => {
        const response = props.confirmPay({
            payType,
            params
        });
        if (typeof response.then === 'function') {
            response.then((res) => {
                pay({
                    response: res,
                    payType
                });
            })
        } else {
            pay({
                response,
                payType
            });
        }
    }

    const openPay = (params) => {

        const { money } = params;

        setParams(params);

        if (process.env.TARO_ENV == 'weapp') {
            return confirmPay({
                payType: 'JSAPI',
                params: params
            });
        }

        if (process.env.TARO_ENV == 'h5') {
            setVisible(true);
            setMoney(money);
        }
    }

    const pay = ({ response, payType }) => {

        const payData = response.payData;

        if (process.env.TARO_ENV === 'weapp') {
            Taro.requestPayment({
                timeStamp: payData.timestamp,
                nonceStr: payData.nonce_str,
                package: payData.pay_package,
                signType: 'MD5',
                paySign: payData.paysign,
                success: onSuccess?.bind(this, response),
                fail: onFail?.bind(this, response),
                complete: onComplete?.bind(this, response)
            })
        }
        if (process.env.TARO_ENV === 'h5') {
            if (payType === 'WAP') {
                try {
                    document.querySelector('body').removeChild(document.querySelector('[name=punchout_form]'));
                } catch (error) {
                    console.log(error);
                }
                appendHTML(document.querySelector('body'), payData);
                document.querySelector('[name=punchout_form]').submit();
            } else if (payType === 'MWEB') {
                formSubmit(payData.mweb_url + '&redirect_url=' + encodeURIComponent(window.location.href));
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
