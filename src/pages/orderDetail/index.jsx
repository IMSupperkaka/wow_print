import React, { useState, useEffect } from 'react'
import Taro, { Events, useDidShow } from '@tarojs/taro'
import classNames from 'classnames';
import { View, Image, Button, Text } from '@tarojs/components'

import './index.less'
import { detail, repay, cancel, receipt } from '../../services/order'
import { orderStatus } from '../../utils/map/order'
import address from '../../../images/icon_address@2x.png'

export default () => {
    const [query, setQuery] = useState({});
    const [orderDetail, setOrderDetail] = useState({});

    useDidShow(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        detail({
            loanId: query.id
        }).then(({ data }) => {
            setOrderDetail(data.data);
        })
    })

    const handleCancel = () => {
        Taro.showModal({
            title: '确认取消',
            content: '是否确认取消订单',
            confirmText: '确认',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    cancel({
                        loanId: query.id
                    }).then(() => {
                        Taro.eventCenter.trigger('updateOrderStatus', query.id);
                        Taro.navigateTo({
                            url: `/pages/result/index?type=cancel`
                        })
                    })
                }
            }
        })
    }

    const handleRepay = () => {
        repay({
            loanId: query.id
        }).then(({ data }) => {
            Taro.requestPayment({
                timeStamp: data.data.timestamp,
                nonceStr: data.data.nonce_str,
                package: data.data.pay_package,
                signType: 'MD5',
                paySign: data.data.paysign,
                success: function (res) {
                    Taro.eventCenter.trigger('updateOrderStatus', query.id);
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_success&id=${query.id}`
                    })
                },
                fail: function (res) {
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_fail&id=${query.id}`
                    })
                }
            })
        })
    }

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

    const goPreview = () => {
        Taro.navigateTo({
            url: `/pages/preview/index?id=${query.id}`
        })
    }

    const handleReceived = () => {
        Taro.showModal({
            title: '确认收货',
            content: '确认已收到商品？非质量问题无法退货退款哦～',
            confirmText: '确认收货',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    receipt({
                        loanId: query.id
                    }).then(() => {
                        Taro.eventCenter.trigger('updateOrderStatus', query.id);
                        Taro.navigateTo({
                            url: `/pages/result/index?type=received&id=${query.id}`
                        })
                    })
                }
            }
        })
    }

    const handleGoLog = () => {
      Taro.navigateTo({
          url: `/pages/logisticsDetails/index?id=${query.id}`
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
                <View className="product-info-content" onClick={goPreview}>
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
                <View className="submit-right">
                    {
                        [2, 3, 4, 5, 9].includes(orderDetail.status) &&
                        <Button onClick={handleGoService} className="radius-btn outline-btn">联系客服</Button>
                    }
                    {
                        orderDetail.status == 3 &&
                        <Button onClick={handleGoLog} className="radius-btn primary-outline-btn">查看物流</Button>
                    }
                    {
                        orderDetail.status == 3 &&
                        <Button onClick={handleReceived} className="radius-btn primary-outline-btn">确认收货</Button>
                    }
                    {
                        orderDetail.status == 1 &&
                        <Button onClick={handleCancel} className="radius-btn outline-btn">取消订单</Button>
                    }
                    {
                        orderDetail.status == 1 &&
                        <Button onClick={handleRepay} className="radius-btn primary-btn">立即付款</Button>
                    }
                </View>
            </View>
        </View>
    )
}
