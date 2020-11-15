import React from 'react';
import { View, Image } from '@tarojs/components';

import emptyPng from './empty@2x.png';
import './index.less';

export default (props) => {
    const { text, src = emptyPng } = props;
    return (
        <View className="wy-empty">
            <Image className="wy-empty-image" mode="widthFix" src={src}/>
            <View className="wy-empty-describe">{ text }</View>
        </View>
    )
}
