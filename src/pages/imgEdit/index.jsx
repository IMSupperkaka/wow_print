import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas, Text } from '@tarojs/components';

import './index.less';

let lastTouch = null;

const ImgEdit = (props) => {

  const { confirmOrder: { userImageList } } = props;
  const [translate, setTranslate] = useState([0, 0]);

  const onTouchStart = (e) => {
    lastTouch = e.touches;
  }

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - lastTouch[0].clientX;
    const dy = e.touches[0].clientY - lastTouch[0].clientY;
    setTranslate(([x, y]) => {
      return [x + dx, y + dy];
    });
    lastTouch = e.touches;
  }

  const imgStyle = {
    transform: `translate(${translate[0]}px, ${translate[1]}px)`
  }

  return (
    <View>
      <View className="mask"></View>
      <View className="top-tip"># 双指拖动、缩放可调整打印范围 #</View>
      <View className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
        <Image style={imgStyle} className="img" src={userImageList[0].originPath}/>
      </View>
      <View className="bottom-tip">tips：灰色区域将被裁剪，不在打印范围内</View>
    </View>
  )
}

export default connect(({ confirmOrder }) => ({
  confirmOrder
}))(ImgEdit);;
