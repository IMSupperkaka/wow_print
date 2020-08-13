import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Image } from '@tarojs/components'

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

        console.log(this.props)

        return (
            <View className='index'>
                <View className="header">
                    <Image />
                    { this.props.user.info.username }
                </View>
            </View>
        )
    }
}

export default Index

