import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import { AtAvatar, AtIcon, AtDivider } from 'taro-ui'

import './index.less'

@connect(({ user }) => ({
    user
}))
class Index extends Component {

    componentWillUnmount() { }

    componentDidShow() {

    }

    componentDidHide() {

    }

    render() {

        return (
            <View className='index'>
                <View className="header">
                    <View className="avatar-wrap">
                        <AtAvatar circle image='https://jdc.jd.com/img/200'></AtAvatar>
                        <View className="user-info">
                            <View>{ this.props.user.info.username || '授权登录' }</View>
                            <View>{ this.props.user.info.username || '定格真我 触手可及' }</View>
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
                            <Text>待付款</Text>
                        </View>
                        <View>
                            <Text>待发货</Text>
                        </View>
                        <View>
                            <Text>待收货</Text>
                        </View>
                        <View>
                            <Text>退款/客服</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default Index

