import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas, Text } from '@tarojs/components';

import './index.less';

let lastTouch = null;

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2), Math.pow(p2.y - p1.y), 2);
}

const contentWidth = 582;
const contentHeight = 833;

const getOrigin = (p1, p2) => {
  return [(p1.x + p2.x) / contentWidth, (p1.y + p2.y) / contentHeight];
}

const ImgEdit = (props) => {

  const { dispatch, confirmOrder: { userImageList, activeIndex } } = props;
  const IMG = userImageList[activeIndex];
  const [translate, setTranslate] = useState(IMG.imgInfo.translate);
  const [scale, setScale] = useState(IMG.imgInfo.scale);
  const [origin, setOrigin] = useState(IMG.imgInfo.origin);

  const onTouchStart = (e) => {
    lastTouch = e.touches;
  }

  const onTouchMove = (e) => {
    if (e.touches.length >= 2) {
      const newscale = getDistance(e.touches[0], e.touches[1]) / getDistance(lastTouch[0], lastTouch[1]);
      const neworigin = getOrigin(e.touches[0], e.touches[1]);
      setOrigin([neworigin[0], neworigin[1]]);
      setScale((scale) => {
        let nowscale = scale * newscale;
        return nowscale;
      })
    } else {
      const dx = e.touches[0].x - lastTouch[0].x;
      const dy = e.touches[0].y - lastTouch[0].y;
      setTranslate(([x, y]) => {
        return [x + dx, y + dy];
      });
    }
    lastTouch = e.touches;
  }

  const onTouchEnd = (e) => {
    const [dx, dy] = translate;
    const resetScale = scale < 1 ? 1 : scale;
    const { width, height } = IMG.imgInfo;
    const imgWidth = contentWidth * scale;
    const imgHeight = (height / width) * imgWidth;
    const limitLeft = (imgWidth - contentWidth) * origin[0];
    const limitRight = -(imgWidth - contentWidth) * (1 - origin[0]);
    const limitTop = (imgHeight - contentHeight) * origin[1];
    const limitBottom = -(imgHeight - contentHeight) * (1 - origin[1]);
    let resetx = dx;
    let resety = dy;
    if (dx > 0 && dx > limitLeft) {
      resetx = limitLeft;
    }
    if (dx < 0 && dx < limitRight) {
      resetx = limitRight;
    }
    if (dy > 0 && dy > limitTop) {
      resety = limitTop;
    }
    if (dy < 0 && dy < limitBottom) {
      resety = limitBottom;
    }
    setScale(resetScale);
    setTranslate([resetx, resety]);
    const cloneList = [...userImageList];
    cloneList[activeIndex].imgInfo = {
      ...cloneList[activeIndex].imgInfo,
      translate: [resetx, resety],
      scale: resetScale,
      origin: origin
    }
    dispatch({
      type: 'confirmOrder/saveUserImageList',
      payload: cloneList
    })
  }

  const { width, height } = IMG.imgInfo;
  const imgWidth = contentWidth;
  const imgHeight = (height / width) * imgWidth;
  const offsetX = imgWidth - contentWidth;
  const offsetY = imgHeight - contentHeight;
  const percentx = (translate[0] - origin[0] * offsetX) / imgWidth * 100;
  const percenty = (translate[1] - origin[1] * offsetY) / imgHeight * 100;

  const imgStyle = {
    transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`,
    transform: `translate(${percentx}%, ${percenty}%) scale(${scale})`,
    width: Taro.pxTransform(imgWidth),
    height: Taro.pxTransform(imgHeight)
  }

  return (
    <View>
      <View className="mask"></View>
      <View className="top-tip"># 双指拖动、缩放可调整打印范围 #</View>
      <Canvas canvasId='canvas' disableScroll={true} className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Image style={imgStyle} className="img" src={IMG.originPath}/>
      </Canvas>
      <View className="bottom-tip">tips：灰色区域将被裁剪，不在打印范围内</View>
      { JSON.stringify(origin) }
    </View>
  )
}

export default connect(({ confirmOrder }) => ({
  confirmOrder
}))(ImgEdit);;
