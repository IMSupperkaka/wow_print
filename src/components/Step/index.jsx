import React from 'react';
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
      nextValue = max;
    }
    propOnChange(nextValue);
  }

  return (
    <View className="wy-step-wrap">
      <Image src={value <= min ? lessDisabledIcon : lessSelectIcon} onClick={(e) => { stopPropagation(e);onChange('less') }} className="opration-btn" />
      <View className="wy-step-value">{value}</View>
      <Image src={plusSelectIcon} onClick={(e) => { stopPropagation(e);onChange('plus') }} className="opration-btn" />
    </View>
  )
}

export default Step;
