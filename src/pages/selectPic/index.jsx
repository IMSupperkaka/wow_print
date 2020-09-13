import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './index.less'
import { uploadFile } from '../../services/upload'
import Dialog from '../../components/Dialog'
import addPic from '../../../images/cion_add to@2x.png'
import deleteIcon from '../../../images/icon_delete／1@2x.png'
import lessSelectIcon from '../../../images/icon_Less／selected@2x.png'
import lessDisabledIcon from '../../../images/icon_Less／disabled@2x.png'
import plusSelectIcon from '../../../images/cion_plus／selected@2x.png'

export default () => {

  const [picList, setPicList] = useState([]);
  const [progress, setProgress] = useState({
    visible: false,
    totalNum: 0,
    completeNum: 0
  })
  const handleChoose = () => {
    Taro.chooseImage({
      success: (e) => {
        setProgress({
          ...progress,
          visible: true,
          totalNum: e.tempFilePaths.length,
          completeNum: 0
        })
        e.tempFilePaths.map((v) => {
          uploadFile({
            filePath: v
          }).then((res) => {
            setProgress((progress) => {
              const completeNum = progress.completeNum + 1;
              return {
                ...progress,
                completeNum: completeNum,
                visible: completeNum < e.tempFilePaths.length
              }
            })
            setPicList((picList) => {
              return [
                ...picList,
                {
                  originPath: v,
                  originImage: res.data,
                  cropImage: res.data,
                  printNums: 1
                }
              ]
            })
          })
        })
      }
    })
  }

  const handleDelete = (index) => {
    let cloneList = [...picList];
    cloneList.splice(index, 1);
    setPicList(cloneList);
  }

  const handleOprate = (index, type) => {
    let cloneList = [...picList];
    let item = cloneList[index];
    if (item.printNums <= 0 && type == 'substract') {
      return;
    }
    cloneList.splice(index, 1, {
      ...item,
      printNums: type == 'substract' ? (item.printNums - 1) : (item.printNums + 1)
    });
    setPicList(cloneList);
  }

  const handleGoPrint = () => {
    if (picList.length <= 0) {
      return Taro.showToast({
        title: '至少选择一张照片',
        icon: 'none'
      })
    }
    const querInfo = Taro.getCurrentInstance().router.params;
    const orderInfo = {
      couponUserId: querInfo.couponUserId,
      goodsInfo: {
        goodId: querInfo.goodId,
        userImageList: picList
      }
    }
    Taro.navigateTo({
      url: `/pages/confirmOrder/index?orderinfo=${JSON.stringify(orderInfo)}`
    })
  }

  return (
    <View className="index">
      <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
      <View className="content">
        {
          picList.map((v, index) => {
            return (
              <View className="item">
                <Image onClick={handleDelete.bind(this, index)} src={deleteIcon} className="delete-icon"/>
                <View className="item-body">
                  <Image className="item-img" mode="aspectFill" src={v.originPath || v.originPath}/>
                </View>
                <View className="item-footer">
                  <View className="step-wrap">
                    <Image src={ v.printNums <= 1 ? lessDisabledIcon : lessSelectIcon} onClick={handleOprate.bind(this, index, 'substract')} className="opration-btn"/>
                    <View>{v.printNums}</View>
                    <Image src={plusSelectIcon} onClick={handleOprate.bind(this, index, 'add')} className="opration-btn"/>
                  </View>
                </View>
              </View>
            )
          })
        }
        <View className="item choose-item" onClick={handleChoose}>
          <View className="item-body">
            <Image src={addPic}/>
            添加照片
          </View>
          <View className="item-footer"></View>
        </View>
      </View>
      <View className="submit-wrap">
        <View>
          <Text>添加照片</Text>
          <Text>已选{ picList.length }张</Text>
        </View>
        <View onClick={handleGoPrint}>去打印</View>
      </View>
      <Dialog className="upload-dialog" title={`已上传${progress.completeNum}/${progress.totalNum}张`} visible={progress.visible}>
        <View>正在拼命上传中，请耐心等待哦～</View>
      </Dialog>
    </View>
  )
}
