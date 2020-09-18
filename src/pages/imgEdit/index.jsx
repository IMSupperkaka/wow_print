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

const ImgEdit = (props) => {

  const { confirmOrder: { userImageList } } = props;
  const [imgInfo, setImgInfo] = useState({});
  const [translate, setTranslate] = useState([0, 0]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    Taro.getImageInfo({
      src: userImageList[0].originPath,
      success: (res) => {
        setImgInfo(res);
      }
    })
  }, []);

  const onTouchStart = (e) => {
    lastTouch = e.touches;
  }

  const onTouchMove = (e) => {
    if (e.touches.length >= 2) {
      const newscale = getDistance(e.touches[0], e.touches[1]) / getDistance(lastTouch[0], lastTouch[1]);
      setScale((scale) => {
        return scale * newscale;
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
    const { width, height } = imgInfo;
    const imgWidth = contentWidth * scale;
    const imgHeight = (height / width) * imgWidth;
    const limitWidth = (imgWidth - contentWidth) / 2;
    const limitHeight = (imgHeight - contentHeight) / 2;
    let resetx = dx;
    let resety = dy;
    if (Math.abs(dx) - limitWidth > 0) {
      resetx = limitWidth * (dx < 0 ? -1 : 1 );
    }
    if (Math.abs(dy) - limitHeight > 0) {
      resety = limitHeight * (dy < 0 ? -1 : 1 );
    }
    setScale(resetScale);
    setTranslate([resetx, resety]);
  }

  const { width, height } = imgInfo;
  const imgWidth = contentWidth * scale;
  const imgHeight = (height / width) * imgWidth;
  const percentx = translate[0] / imgWidth * 100;
  const percenty = translate[1] / imgHeight * 100;

  const imgStyle = {
    transform: `translate(${percentx}%, ${percenty}%) scale(${scale})`
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
