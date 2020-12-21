import React from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';

import './index.less'
import lessSelectIcon from '../../../images/icon_Less_selected@2x.png'
import lessDisabledIcon from '../../../images/icon_Less_disabled@2x.png'
import plusSelectIcon from '../../../images/cion_plus_selected@2x.png'

const stopPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
}

const Step = ({ value, onChange: propOnChange, setp = 1, min = 1, max = Infinity }) => {

    const onChange = (type) => {
        let nextValue = value;
        if (type == 'less') {
            nextValue = value - setp;
        } else {
            nextValue = value + setp;
        }
        if (nextValue < min) {
            nextValue = min;
        }
        if (nextValue > max) {
            Taro.showToast({
                title: '不能再增加了~',
                icon: 'none',
                duration: 2000
            })
            nextValue = max;
        }
        propOnChange(nextValue);
    }

    return (
        <View className="wy-step-wrap">
            <View className="opration-btn" onClick={(e) => { stopPropagation(e); onChange('less') }}>
                <Image className="opration-btn-image" src={value <= min ? lessDisabledIcon : lessSelectIcon} />
            </View>
            <View className="wy-step-value">{value}</View>
            <View className="opration-btn" onClick={(e) => { stopPropagation(e); onChange('plus') }}>
                <Image src={plusSelectIcon} className="opration-btn-image" />
            </View>
        </View>
    )
}

export default Step;
