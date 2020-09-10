import React from 'react';
import { View } from '@tarojs/components';

import './index.less';

export default (props) => {
  return (
    <View {...props} className={props.active ? 'wy-tabs__active' : ''}>
        {props.title}
    </View>
  )
}
