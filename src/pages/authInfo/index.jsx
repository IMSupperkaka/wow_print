import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Image } from '@tarojs/components'

import './index.less'

class Index extends Component {
    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() { }

    componentDidShow() {
        
    }

    componentDidHide() { }

    render() {
        return (
            <View className='index'>
                <View className="header">
                    <Button openType="getUserInfo">授权用户信息</Button>
                </View>
            </View>
        )
    }
}

export default Index

