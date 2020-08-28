import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtButton, AtInput, AtForm } from 'taro-ui';
import { getSetting } from '../../utils/openMethod';
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
            <AtInput
                name='value'
                type='text'
                placeholder='收件人'
                value={username}
                onChange={(value) => {
                    setUserName(value);
                }}
            />
            <AtButton className="save-btn" type="primary">保存并使用</AtButton>
            <AtButton className="use-wx-location" type="primary" onClick={onGetAddress}>使用微信地址</AtButton>
        </View>
    )
}