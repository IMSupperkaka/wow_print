import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Input } from '@tarojs/components';
import { AtButton, AtInput, AtForm } from 'taro-ui';
import { getSetting } from '../../utils/openMethod';
import Cell from '../../components/Cell';
import './index.less';

export default () => {

    const [username, setUserName] = useState();

    const onGetAddress = (e) => {
        getSetting('scope.address', {
            success: () => {
                Taro.chooseAddress({
                    success: (result) => {
                        console.log(result)
                    }
                })
            }
        })
    }

    return (
        <View>
            <View className="address-wrap">
                <Cell>
                    <Input
                        name='value'
                        type='text'
                        placeholder='收件人'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        onInput={(event) => {
                            setUserName(event.detail.value);
                        }}
                    />
                </Cell>
                <Cell>
                    <Input
                        name='value'
                        type='text'
                        placeholder='手机号码'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        onInput={(event) => {
                            setUserName(event.detail.value);
                        }}
                    />
                </Cell>
                <Cell title="所在地区" isLink></Cell>
                <Cell>
                    <Input
                        name='value'
                        type='text'
                        placeholder='详细地址：如街道门牌、楼层房间等信息'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        onInput={(event) => {
                            setUserName(event.detail.value);
                        }}
                    />
                </Cell>
            </View>
            <Cell className="set-default" title="设为默认地址">
                123
            </Cell>
            <AtButton className="save-btn" type="primary">保存并使用</AtButton>
            <AtButton className="use-wx-location" type="primary" onClick={onGetAddress}>使用微信地址</AtButton>
        </View>
    )
}