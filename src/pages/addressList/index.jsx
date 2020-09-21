import React, { Component, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import { connect } from 'react-redux'

import './index.less'
import Empty from '../../components/Empty'
import SafeArea from '../../components/SafeArea'
import { list } from '../../services/address'

const AddresssList = ({ dispatch }) => {
    const [addressList, setAddressList] = useState([]);

    useDidShow(() => {
        list().then(({ data }) => {
            setAddressList(data.data);
        })
    })

    const goEdit = (address, e) => {
        e.stopPropagation();
        Taro.navigateTo({
            url: `/pages/addressEdit/index?type=edit&id=${address.id}`
        })
    }

    const handleClickAddressItem = (address) => {
        const querInfo = Taro.getCurrentInstance().router.params;
        if (querInfo.type == 'choose') {
            Taro.navigateBack();
            dispatch({
                type: 'confirmOrder/saveAddressInfo',
                payload: address
            })
        } else {
            Taro.navigateTo({
                url: `/pages/addressEdit/index?type=edit&id=${address.id}`
            })
        }
    }

    const handleAddAddress = () => {
        Taro.navigateTo({
            url: '/pages/addressEdit/index?type=add'
        })
    }

    return (
        <View>
            {
                addressList.length <= 0 ?
                    <Empty text="可新增地址，常回来看看" /> :
                    <View className="address-list-wrap">
                        {
                            addressList.map((address) => {
                                return (
                                    <View className="address-item" onClick={handleClickAddressItem.bind(this, address)}>
                                        <View>
                                            <View className="address-user">
                                                <Text>{address.recipient}</Text>
                                                <Text>{address.phone}</Text>
                                                {
                                                    address.isDefault == 1 &&
                                                    <View className="default">默认</View>
                                                }
                                            </View>
                                            <View className="address-info">{address.province + address.city + address.area + address.address}</View>
                                        </View>
                                        <View className="edit" onClick={goEdit.bind(this, address)}>编辑</View>
                                    </View>
                                )
                            })
                        }
                    </View>
            }
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View className="new-address-wrap" style={{ bottom: Taro.pxTransform(bottom + 32) }}>
                            <AtButton className="new-address" type="primary" onClick={handleAddAddress}>新增收获地址</AtButton>
                        </View>
                    )
                }}
            </SafeArea>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(AddresssList);
