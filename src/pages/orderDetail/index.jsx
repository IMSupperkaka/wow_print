import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import classNames from 'classnames';
import { View, Image, Button, Text } from '@tarojs/components'

import './index.less'
import { detail } from '../../services/order'
import { orderStatus } from '../../utils/map/order'
import address from '../../../images/icon_address@2x.png'

export default () => {
    const [query, setQuery] = useState({});
    const [orderDetail, setOrderDetail] = useState({});

    useEffect(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        detail({
            loanId: query.id
        }).then(({ data }) => {
            setOrderDetail(data.data);
        })
    }, [])

    const handleCopy = (data) => {
        Taro.setClipboardData({
            data: data
        })
    }

    const handleGoService = () => {
        Taro.navigateTo({
            url: '/pages/service/index'
        })
    }

    const greyHeader = [4, 5].includes(orderDetail.status);

    const goodsInfo = orderDetail?.goodsInfo?.[0] || {};

    return (
        <View>
            <View className={classNames('header', greyHeader && 'grey')}>
                <Text>{ orderStatus.get(orderDetail.status) }</Text>
            </View>
            <View className="address-info">
                <Image src={address}/>
                <View>
                    <View>{ orderDetail.recipient } { orderDetail.phone }</View>
                    <View>{ orderDetail.province + orderDetail.city + orderDetail.area + orderDetail.address }</View>
                </View>
            </View>
            <View className="product-info">
                <View className="product-info-content">
                    <Image className="product-image" mode="aspectFill" src={goodsInfo.indexImage}/>
                    <View className="product-content">
                        <View>
                            { goodsInfo.goodName }
                        </View>
                        <View>
                            <Text>￥{ (goodsInfo.sellingPrice / 100).toFixed(2) }</Text>
                            <Text>x{ goodsInfo.goodsNums }</Text>
                        </View>
                    </View>
                </View>
                <View className="product-pay-info">
                    <View>
                        <Text>优惠券</Text>
                        <Text>{ orderDetail.couponName }</Text>
                    </View>
                    <View>
                        <Text>运费</Text>
                        <Text>￥{ (orderDetail.shipMoney / 100).toFixed(2) }</Text>
                    </View>
                    <View>
                        <Text>合计</Text>
                        <Text>￥{ (orderDetail.money / 100).toFixed(2) }</Text>
                    </View>
                </View>
            </View>
            <View className="order-info">
                <View>
                    <View>订单编号</View>
                    <View>
                        <Text>{ orderDetail.loanNo }</Text>
                        <Text onClick={handleCopy.bind(this, orderDetail.loanNo)} className="copy">复制</Text>
                    </View>
                </View>
                <View>
                    <View>支付方式</View>
                    <View>
                        微信支付
                    </View>
                </View>
                <View>
                    <View>创建时间</View>
                    <View>
                        { orderDetail.createTime }
                    </View>
                </View>
            </View>
            <View className="submit-bar">
                <View></View>
                <View>
                    {
                        [2, 3, 4, 5, 9].includes(orderDetail.status) &&
                        <Button onClick={handleGoService} className="radius-btn outline-btn">联系客服</Button>
                    }
                    {
                        orderDetail.status == 3 &&
                        <Button className="radius-btn primary-outline-btn">确认收货</Button>
                    }
                </View>
            </View>
        </View>
    )
}
