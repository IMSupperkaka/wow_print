import React, { useState, useEffect } from 'react'
import Taro, { Events, useDidShow } from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import classNames from 'classnames';
import { View, Image, Button, Text } from '@tarojs/components'

import styles from './index.module.less'
import { detail, repay, cancel, receipt } from '../../services/order'
import { orderStatus } from '../../utils/map/order'
import address from '../../../images/icon_address@2x.png'

export default () => {
    const [query, setQuery] = useState({});
    const [orderDetail, setOrderDetail] = useState({
      goodsInfo: []
    });

    // TODO:初始值给从订单拿到的倒计时值
    const [countDown, setCountDown] = useState(100)

    useDidShow(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        detail({
            loanId: query.id
        }).then(({ data }) => {
            setOrderDetail(data.data);
        })
    })

    useEffect(() => {
        if(orderDetail.status == '1') {
            let timer = setTimeout(() => {
                // TODO:初始值给从订单拿到的倒计时值
                setCountDown(countDown - 1)
            }, 1000)
            if(!+countDown) {
                clearTimeout(timer)
            }
        }
    }, [countDown, orderDetail.status])

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
                            url: `/pages/result/index?type=cancel&id=${query.id}`
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
                    Taro.showToast({
                        title:'取消支付',
                        icon:'none',
                        duration:1000
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

        if (orderDetail.imageSynthesisStatus != 1) {
            return Taro.showToast({
                title:'杰作生成中，稍后再看哦',
                icon: 'none',
                duration: 1000
            })
        }

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

    const handleChooseAddress = () => {
        Taro.navigateTo({
            url: `/pages/addressList/index?type=choose`
        })
    }

    const handleGoLog = () => {
      Taro.navigateTo({
          url: `/pages/logisticsDetails/index?id=${query.id}`
      })
    }

    //TODO: 背景置灰加一个已关闭的状态
    const greyHeader = [4, 5].includes(orderDetail.status);

    return (
        <View className={styles["order-detail"]}>
            <View className={classNames('header', greyHeader && 'grey')}>
                <Text>{ orderStatus.get(orderDetail.status) }</Text>
                {
                    orderDetail.status == 1 && 
                    <Text>{ countDown }后订单关闭</Text>
                }
            </View>
            <View className="address-info">
                <Image src={address} className="position-icon"/>
                <View className="address">
                    <View className="address-item">{ orderDetail.recipient } { orderDetail.phone }</View>
                    <View className="address-item">{ orderDetail.province + orderDetail.city + orderDetail.area + orderDetail.address }</View>
                </View>
            </View>
            <View className="product-info">
                {
                  orderDetail.goodsInfo.map((goodsInfo) => {
                    return (
                      <View className="product-info-content">
                        <Image className="product-image" mode="aspectFill" src={goodsInfo.indexImage}/>
                        <View className="product-content">
                            <View className="product-list">
                                <View className="product-name">
                                    { goodsInfo.goodName }
                                    {
                                        goodsInfo.goodIsMaster == 0 &&
                                        <View className="match-icon">搭配</View>
                                    }
                                </View>
                                {
                                    goodsInfo.goodIsMaster == 1 &&
                                    <View onClick={goPreview} className="preview-btn">
                                        预览
                                        <AtIcon value='chevron-right' size='12' color='#666'></AtIcon>
                                    </View>
                                }
                            </View>
                            <View className="num-content">
                                <Text>￥{ (goodsInfo.sellingPrice / 100).toFixed(2) }</Text>
                                <Text>x{ goodsInfo.goodsNums }</Text>
                            </View>
                        </View>
                    </View>
                    )
                  })
                }
                <View className="product-pay-info">
                    <View className="pay-item">
                        <Text>商品总价</Text>
                        <Text>￥{ (orderDetail.money / 100 + orderDetail.discountMoney / 100 - orderDetail.shipMoney / 100).toFixed(2) }</Text>
                    </View>
                    {
                      orderDetail.couponName &&
                      <View className="pay-item">
                        <Text>优惠</Text>
                        <Text>{ orderDetail.couponName }</Text>
                      </View>
                    }
                    <View className="pay-item">
                        <Text>运费</Text>
                        <Text>￥{ (orderDetail.shipMoney / 100).toFixed(2) }</Text>
                    </View>
                    <View className="pay-item">
                        <Text>合计</Text>
                        <Text className="total-amount">￥{ (orderDetail.money / 100).toFixed(2) }</Text>
                    </View>
                </View>
            </View>
            <View className="order-info">
                <View className="order-info-item">
                    <View>订单编号</View>
                    <View>
                        <Text>{ orderDetail.loanNo }</Text>
                        <Text onClick={handleCopy.bind(this, orderDetail.loanNo)} className="copy">复制</Text>
                    </View>
                </View>
                <View className="order-info-item">
                    <View>支付方式</View>
                    <View>
                        微信支付
                    </View>
                </View>
                <View className="order-info-item">
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
                        <Button onClick={handleChooseAddress} className="radius-btn outline-btn">修改地址</Button>
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
