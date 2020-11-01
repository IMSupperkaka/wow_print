import React from 'react';
import classNames from 'classnames';
import { View } from '@tarojs/components';

import './index.less';

export default (props) => {
  return (
    <View className={classNames('wy-card-wrap', props.className)} {...props}>
      {
        props.title &&
        <View className="wy-card-title">{ props.title }</View>
      }
      <View className={classNames('wy-card-body', props.bodyClassName)}>
        { props.children }
      </View>
    </View>
  )
}
