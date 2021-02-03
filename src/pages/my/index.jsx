import React, { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import styles from './index.module.less'
import { info } from '@/services/user'
import defaultAvatorPng from '@/images/bg_avatar__default@2x.png'
import waitpayPng from '@/images/order_waitpay.png'
import deliverPng from '@/images/order_deliver.png'
import receivePng from '@/images/order_receive.png'
import refundPng from '@/images/order_refund.png'
import couponPng from '@/images/my_icon_coupons@2x.png'
import addressPng from '@/images/my_icon_address@2x.png'
import portfolioPng from '@/images/my_icon_draft_box@2x.png'

const Index = ({ user }) => {

    const [state, setState] = useState({
        couponCanUseNums: 0
    });

    useDidShow(() => {
        info().then(({ data }) => {
            setState(data.data);
        })
    })

    const handleGoAuth = () => {
        Taro.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.userInfo'] || !user.info.nickName) {
                    Taro.navigateTo({
                        url: '/pages/authInfo/index'
                    })
                }
            }
        })
    }

    const handleGoAddress = () => {
        Taro.navigateTo({
            url: '/pages/addressList/index'
        })
    }

    const handleGoPortfolio = () => {
        Taro.navigateTo({
            url: '/pages/portfolio/index'
        })
    }

    const handleGoCoupon = () => {
        Taro.switchTab({
            url: '/pages/coupon/index'
        })
    }

    const goOrder = (current) => {
        Taro.navigateTo({
            url: `/pages/myOrder/index?current=${current}`
        })
    }

    const goService = () => {
        Taro.navigateTo({
            url: '/pages/service/index'
        })
    }

    return (
        <View className={styles['index']}>
            <View className={styles['header']}>
                <View className={styles['avatar-wrap']} onClick={handleGoAuth}>
                    <Image src={user.info.avatarUrl || defaultAvatorPng} className={styles['avatar']}/>
                    <View className={styles['user-info']}>
                        <View className={styles['user-name']}>{ user.info.nickName || '授权登录' }</View>
                        <View className={styles['user-descripe']}>定格真我 触手可及</View>
                    </View>
                </View>
            </View>
            <View className={styles['my-orders']}>
                <View className={styles['title']} onClick={() => { goOrder(0) }}>
                    <Text className={styles['title-left']}>我的订单</Text>
                    <View className={styles['title-right']}>
                        <Text>查看全部</Text>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                </View>
                <View className={styles['order-icons']}>
                    <View className={styles['order-icons-item']} onClick={() => { goOrder(1) }}>
                        <Image className={styles['order-icons-icon']} src={waitpayPng}/>
                        <Text>待付款</Text>
                        {
                            state.waitPayNums > 0 &&
                            <View className={styles['order-icons-tip']}>{ state.waitPayNums }</View>
                        }
                    </View>
                    <View className={styles['order-icons-item']} onClick={() => { goOrder(2) }}>
                        <Image className={styles['order-icons-icon']} src={deliverPng}/>
                        <Text>待发货</Text>
                        {
                            state.waitShipNums > 0 &&
                            <View className={styles['order-icons-tip']}>{ state.waitShipNums }</View>
                        }
                    </View>
                    <View className={styles['order-icons-item']} onClick={() => { goOrder(3) }}>
                        <Image className={styles['order-icons-icon']} src={receivePng}/>
                        <Text>待收货</Text>
                        {
                            state.waitReceiptNums > 0 &&
                            <View className={styles['order-icons-tip']}>{ state.waitReceiptNums }</View>
                        }
                    </View>
                    <View className={styles['order-icons-item']} onClick={goService}>
                        <Image className={styles['order-icons-icon']} src={refundPng}/>
                        <Text>退款/客服</Text>
                    </View>
                </View>
            </View>
            <View className={styles['cell-wrap']}>
                <View className={styles['cell']} onClick={handleGoCoupon}>
                    <View className={styles['cell-left']}>
                        <Image className={styles['icon-left']} src={couponPng}/>
                        <Text>优惠券</Text>
                    </View>
                    <View className={styles['cell-right']}>
                        <Text className={styles['use-coupon']}>可使用{ state.couponCanUseNums }张</Text>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                </View>
                <View className={styles['cell']} onClick={handleGoPortfolio}>
                    <View className={styles['cell-left']}>
                        <Image className={styles['icon-left']} src={portfolioPng}/>
                        <Text>作品集</Text>
                    </View>
                    <View className={styles['cell-right']}>
                        <Text className={styles['use-portfolio']}>{ state.portfolioNums }</Text>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                </View>
                <View className={styles['cell']} onClick={handleGoAddress}>
                    <View className={styles['cell-left']}>
                        <Image className={styles['icon-left']} src={addressPng}/>
                        <Text>收货地址</Text>
                    </View>
                    <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                </View>
            </View>
        </View>
    )
}

export default connect(({ user }) => ({
    user
}))(Index);
