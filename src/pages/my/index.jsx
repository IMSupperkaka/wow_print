import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import { AtAvatar, AtIcon, AtDivider } from 'taro-ui'

import './index.less'
import waitpayPng from '../../../images/order_waitpay.png';
import deliverPng from '../../../images/order_deliver.png';
import receivePng from '../../../images/order_receive.png';
import refundPng from '../../../images/order_refund.png';
import couponPng from '../../../images/my_icon_coupons@2x.png';
import addressPng from '../../../images/my_icon_address@2x.png';

@connect(({ user }) => ({
    user
}))
class Index extends Component {

    componentWillUnmount() { }

    componentDidShow() {

    }

    componentDidHide() {

    }

    handleGoAuth = () => {
        const { user } = this.props;
        if (!user.username) {
            Taro.navigateTo({
                url: '/pages/authInfo/index'
            })
        }
    }

    handleGoAddress = () => {
        Taro.navigateTo({
            url: '/pages/addressList/index'
        })
    }

    render() {

        return (
            <View className='index'>
                <View className="header">
                    <View className="avatar-wrap">
                        <AtAvatar circle image={this.props.user.info.avatarUrl || 'https://jdc.jd.com/img/200'}></AtAvatar>
                        <View className="user-info" onClick={this.handleGoAuth}>
                            <View>{ this.props.user.info.nickName || '授权登录' }</View>
                            <View>定格真我 触手可及</View>
                        </View>
                    </View>
                </View>
                <View className="my-orders">
                    <View className="title">
                        <Text>我的订单</Text>
                        <View>
                            <Text>查看更多</Text>
                            <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                        </View>
                    </View>
                    <AtDivider height="48" lineColor='#F2F2F2'/>
                    <View className="order-icons">
                        <View>
                            <Image src={waitpayPng}/>
                            <Text>待付款</Text>
                        </View>
                        <View>
                            <Image src={deliverPng}/>
                            <Text>待发货</Text>
                        </View>
                        <View>
                            <Image src={receivePng}/>
                            <Text>待收货</Text>
                        </View>
                        <View>
                            <Image src={refundPng}/>
                            <Text>退款/客服</Text>
                        </View>
                    </View>
                </View>
                <View className="cell-wrap">
                    <View className="cell">
                        <View className="cell-left">
                            <Image className="icon-left" src={couponPng}/>
                            <Text>优惠券</Text>
                        </View>
                        <AtIcon value='chevron-right' size='14' color='#999'></AtIcon>
                    </View>
                    <View className="cell" onClick={this.handleGoAddress}>
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
}

export default Index

