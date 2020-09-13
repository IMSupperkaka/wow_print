import React, { useState, useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './index.less'
import { create } from '../../services/order'

export default () => {

    const [orderParams, setOrderParams] = useState({
        addressId: null,
        couponUserId: null
    });

    useEffect(() => {
        const querInfo = Taro.getCurrentInstance().router.params;
        const orderInfo = JSON.parse(querInfo.orderinfo);
        setOrderParams(orderInfo);
    }, [])

    const submitOrder = (orderParams) => {
        create({
            addressId: orderParams.addressId,
            couponUserId: orderParams.couponUserId,
            goodsInfo: orderParams.goodsInfo
        }).then(({ data }) => {
            Taro.requestPayment({
                timeStamp: data.data.timestamp,
                nonceStr: data.data.nonce_str,
                package: data.data.pay_package,
                signType: 'MD5',
                paySign: data.data.paysign,
                success: function (res) {
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_success&id=${data.data.id}`
                    })
                },
                fail: function (res) {
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_fail&id=${data.data.id}`
                    })
                }
            })
        })
    }

    return (
        <View className="index">
            <View className="submit-wrap">
                <View></View>
                <View onClick={submitOrder.bind(this, orderParams)}>提交订单</View>
            </View>
        </View>
    )
}
