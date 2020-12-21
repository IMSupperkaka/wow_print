import React, { Component, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import { connect } from 'react-redux'

import styles from './index.module.less'
import Empty from '../../components/Empty'
import SafeArea from '../../components/SafeArea'
import { list, change } from '../../services/address'
import Toast from '../../components/Toast'

const AddresssList = ({ dispatch }) => {
    const [addressList, setAddressList] = useState([]);

    const [dialogVisible, setDialogVisible] = useState(false);

    const [addressItem, setAddressItem] = useState({});

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
        } else if (querInfo.type == 'edit') {
            Taro.navigateTo({
                url: `/pages/addressEdit/index?type=edit&id=${address.id}`
            })
        } else if (querInfo.type == 'change') {
            setAddressItem(address)
            setDialogVisible(true)
        }
    }

    const handleAddAddress = () => {
        Taro.navigateTo({
            url: '/pages/addressEdit/index?type=add'
        })
    }

    const confrimChange = () => {
        const querInfo = Taro.getCurrentInstance().router.params;
        change({
            loanId: querInfo.id,
            addressId: addressItem.id
        }).then(() => {
            setDialogVisible(false);
            Taro.eventCenter.trigger('updateOrderStatus', router.query.id);
            Taro.navigateBack();
        })
    }

    return (
        <View>
            {
                addressList.length <= 0 ?
                    <Empty text="可新增地址，常回来看看" /> :
                    <View className={styles["address-list-wrap"]}>
                        {
                            addressList.map((address, index) => {
                                return (
                                    <View key={index} className={styles["address-item"]} onClick={handleClickAddressItem.bind(this, address)}>
                                        <View>
                                            <View className={styles["address-user"]}>
                                                <Text>{address.recipient}</Text>
                                                <Text>{address.phone}</Text>
                                                {
                                                    address.isDefault == 1 &&
                                                    <View className={styles["default"]}>默认</View>
                                                }
                                            </View>
                                            <View className={styles["address-info"]}>{address.province + address.city + address.area + address.address}</View>
                                        </View>
                                        <View className={styles["edit"]} onClick={goEdit.bind(this, address)}>编辑</View>
                                    </View>
                                )
                            })
                        }
                    </View>
            }
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View className={styles["new-address-wrap"]} style={{ bottom: Taro.pxTransform(bottom + 32, 750) }}>
                            <AtButton className={styles["new-address"]} type="primary" onClick={handleAddAddress}>新增收货地址</AtButton>
                        </View>
                    )
                }}
            </SafeArea>
            <Toast title="确认修改" visible={dialogVisible} className="home-dialog" onClose={() => { setDialogVisible(false) }} onSuccess={confrimChange}>
                <View className={styles["dialog-content"]}>
                    <View className={styles["info-item"]}>
                        <Text className={styles["name"]}>{addressItem.recipient}</Text>
                        <Text>{addressItem.phone}</Text>
                    </View>
                    <View className={styles["info-item"]}>
                        {`${addressItem.province} ${addressItem.city} ${addressItem.area} ${addressItem.address}`}
                    </View>
                </View>
            </Toast>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(AddresssList);
