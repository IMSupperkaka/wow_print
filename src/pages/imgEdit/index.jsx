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
    const dx = e.touches[0].x - lastTouch[0].x;
    const dy = e.touches[0].y - lastTouch[0].y;
    setTranslate(([x, y]) => {
      return [x + dx, y + dy];
    });
    lastTouch = e.touches;
  }

  const onTouchEnd = (e) => {
    const resetx = translate[0] > 0 ? 0 : translate[0];
    const resety = translate[1] > 0 ? 0 : translate[1];
    setTranslate([resetx, resety]);
  }

  const imgStyle = {
    transform: `translate(${translate[0]}px, ${translate[1]}px)`
  }

  return (
    <View>
      <View className="mask"></View>
      <View className="top-tip"># 双指拖动、缩放可调整打印范围 #</View>
      <Canvas canvasId='canvas' disableScroll={true} className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Image mode="widthFix" style={imgStyle} className="img" src={userImageList[0].originPath}/>
      </Canvas>
      <View className="bottom-tip">tips：灰色区域将被裁剪，不在打印范围内</View>
    </View>
  )
}

export default connect(({ confirmOrder }) => ({
  confirmOrder
}))(ImgEdit);;
