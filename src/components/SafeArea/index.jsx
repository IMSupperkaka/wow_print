import React from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

export default (props) => {

    const systemInfo = Taro.getSystemInfoSync();
    const { safeArea } = systemInfo;

    const isIphoneX = safeArea?.top > 44;

    return props.children({ bottom: isIphoneX ? 44 : 0 });
}