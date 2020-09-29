import React, { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import { AtAvatar, AtIcon, AtDivider } from 'taro-ui'

import './index.less'
import { info } from '../../services/user'
import defaultAvatorPng from '../../../images/bg_avatar__default@2x.png'
import waitpayPng from '../../../images/order_waitpay.png'
import deliverPng from '../../../images/order_deliver.png'
import receivePng from '../../../images/order_receive.png'
import refundPng from '../../../images/order_refund.png'
import couponPng from '../../../images/my_icon_coupons@2x.png'
import addressPng from '../../../images/my_icon_address@2x.png'

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
        <View className='index'>
            <View className="header">
                <View className="avatar-wrap" onClick={handleGoAuth}>
                    <Image src={user.info.avatarUrl || defaultAvatorPng} className="avatar"/>
                    <View className="user-info">
                        <View>{ user.info.nickName || '授权登录' }</View>
                        <View>定格真我 触手可及</View>
                    </View>
                </View>
            </View>
            <View className="my-orders">
                <View className="title" onClick={() => { goOrder(0) }}>
                    <Text>我的订单</Text>
                    <View>
                        <Text>查看全部</Text>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                </View>
                <View className="order-icons">
                    <View onClick={() => { goOrder(1) }}>
                        <Image src={waitpayPng}/>
                        <Text>待付款</Text>
                        {
                            state.waitPayNums > 0 &&
                            <View className="order-icons-tip">{ state.waitPayNums }</View>
                        }
                    </View>
                    <View onClick={() => { goOrder(2) }}>
                        <Image src={deliverPng}/>
                        <Text>待发货</Text>
                        {
                            state.waitShipNums > 0 &&
                            <View className="order-icons-tip">{ state.waitShipNums }</View>
                        }
                    </View>
                    <View onClick={() => { goOrder(3) }}>
                        <Image src={receivePng}/>
                        <Text>待收货</Text>
                        {
                            state.waitReceiptNums > 0 &&
                            <View className="order-icons-tip">{ state.waitReceiptNums }</View>
                        }
                    </View>
                    <View onClick={goService}>
                        <Image src={refundPng}/>
                        <Text>退款/客服</Text>
                    </View>
                </View>
            </View>
            <View className="cell-wrap">
                <View className="cell" onClick={handleGoCoupon}>
                    <View className="cell-left">
                        <Image className="icon-left" src={couponPng}/>
                        <Text>优惠券</Text>
                    </View>
                    <View>
                        <Text className="use-coupon">可使用{ state.couponCanUseNums }张</Text>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                </View>
                <View className="cell" onClick={handleGoAddress}>
                    <View className="cell-left">
                        <Image className="icon-left" src={addressPng}/>
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
