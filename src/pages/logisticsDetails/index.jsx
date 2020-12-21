import React, { useState } from 'react';
import Taro, { useReady } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

import './index.less';
import { orderStatus } from '../../utils/map/order';
import { logistics } from '../../services/order';

export default () => {

    const [detail, setDetail] = useState({
        courierCompany: '',
        trackingNumber: ''
    });

    useReady(() => {
        const query = Taro.getCurrentInstance().router.params;
        logistics({
            loanId: query.id
        }).then(({ data }) => {
            setDetail(data.data);
        })
    })

    const handleCopy = () => {
        Taro.setClipboardData({
            data: detail.trackingNumber,
            success: function (res) {
                Taro.showToast({
                    title: '快递单号已复制',
                    icon: 'none',
                    duration: 1000
                })
            }
        })
    }

    return (
        <View>
            <View className="box">
                <View className="title">{orderStatus.get(detail.status)}</View>
                <View className="item">
                    <View>物流名称</View>
                    <View>{detail.courierCompany}</View>
                </View>
                <View className="item">
                    <View>快递单号</View>
                    <View>
                        <Text>{detail.trackingNumber}</Text>
                        <Text className="copy" onClick={handleCopy}>复制</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
