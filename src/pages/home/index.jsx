import React, { Component } from 'react'
import { View, Button, Text } from '@tarojs/components'

import './index.less'

class Index extends Component {
    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    render() {
        return (
            <View className='index'>
                home
            </View>
        )
    }
}

export default Index

