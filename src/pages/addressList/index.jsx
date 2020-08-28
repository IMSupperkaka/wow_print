import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import Empty from '../../components/Empty'
import './index.less'

class Detail extends Component {

    constructor(props) {
        super(props);
    }

    goEdit = () => {
        Taro.navigateTo({
            url: '/pages/addressEdit/index'
        })
    }

    render() {
        return (
            <View>
                <Empty text="可新增地址，常回来看看"/>
                <AtButton className="new-address" type="primary" onClick={this.goEdit}>新增收获地址</AtButton>
            </View>
        )
    }
}

export default Detail;