import React, { Component, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import './index.less'
import Empty from '../../components/Empty'
import { list } from '../../services/address'

export default () => {

    const [addressList, setAddressList] = useState([]);

    useEffect(() => {
        list().then(({ data }) => {
            setAddressList(data.data);
        })
    }, []);

    const goEdit = () => {
        Taro.navigateTo({
            url: '/pages/addressEdit/index'
        })
    }

    return (
        <View>
            {
                addressList.length <= 0 ?
                <Empty text="可新增地址，常回来看看"/> :
                <View className="address-list-wrap">
                    {
                        addressList.map((address) => {
                            return (
                                <View className="address-item">
                                    <View>
                                        <View className="address-user">
                                            <Text>{ address.recipient }</Text>
                                            <Text>{ address.phone }</Text>
                                            {
                                                address.isDefault == 1 &&
                                                <View className="default">默认</View>
                                            }
                                        </View>
                                        <View className="address-info">{ address.province + address.city + address.area + address.address }</View>
                                    </View>
                                    <View className="edit">编辑</View>
                                </View>
                            )
                        })
                    }
                </View>
            }
            <AtButton className="new-address" type="primary" onClick={goEdit}>新增收获地址</AtButton>
        </View>
    )
};
