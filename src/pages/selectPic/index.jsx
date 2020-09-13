import React, { useState } from 'react'
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './index.less'

export default () => {

  const [picList, setPicList] = useState([]);

  const handleChoose = () => {
    Taro.chooseImage({
      success: (e) => {
        setPicList([
          ...picList,
          ...(e.tempFilePaths.map((v) => {
            return {
              originPath: v
            }
          }))
        ])
        console.log(e);
      }
    })
  }

  return (
    <View>
      <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
      <View className="content">
        {
          picList.map((v) => {
            return (
              <View className="item">
                <View className="item-body">
                  <Image className="item-img" mode="aspectFill" src={v.originPath}/>
                </View>
                <View className="item-footer"></View>
              </View>
            )
          })
        }
        <View className="item choose-item" onClick={handleChoose}>
          <View className="item-body">
            添加照片
          </View>
          <View className="item-footer"></View>
        </View>
      </View>
    </View>
  )
}
