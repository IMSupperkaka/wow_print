import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import './index.less'
import { uploadFile } from '../../services/upload'
import Dialog from '../../components/Dialog'
import addPic from '../../../images/cion_add to@2x.png'
import deleteIcon from '../../../images/icon_delete／1@2x.png'
import lessSelectIcon from '../../../images/icon_Less／selected@2x.png'
import lessDisabledIcon from '../../../images/icon_Less／disabled@2x.png'
import plusSelectIcon from '../../../images/cion_plus／selected@2x.png'

const getImgStyle = ({ width, height, origin, translate, scale }) => {
  const contentWidth = 300;
  const contentHeight = 429;
  let imgWidth;
  let imgHeight;
  if (width / height <= contentWidth / contentHeight) {
    imgWidth = contentWidth;
    imgHeight = (height / width) * imgWidth;
  } else {
    imgHeight = contentHeight;
    imgWidth = (width / height) * imgHeight;
  }
  const offsetX = imgWidth - contentWidth;
  const offsetY = imgHeight - contentHeight;
  const percentx = translate[0] / (582 / contentWidth) - origin[0] * offsetX;
  const percenty = translate[1] / (833 / contentHeight) - origin[1] * offsetY;

  return {
    transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`,
    transform: `translate3d(${Taro.pxTransform(percentx)}, ${Taro.pxTransform(percenty)}, 0) scale(${scale})`,
    width: Taro.pxTransform(imgWidth),
    height: Taro.pxTransform(imgHeight)
  }
}

const SelectPic = ({ dispatch, confirmOrder }) => {

  const { coupon, userImageList } = confirmOrder;

  // const [picList, setPicList] = useState([]);
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
        let list = [];
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
            Taro.getImageInfo({
              src: v,
              success: (res) => {
                list.push({
                  originPath: v,
                  originImage: res.data,
                  cropImage: res.data,
                  printNums: 1,
                  imgInfo: {
                    ...res,
                    origin: [0.5, 0.5],
                    scale: 1,
                    translate: [0, 0]
                  }
                })
                if (list.length === e.tempFilePaths.length) {
                  dispatch({
                    type: 'confirmOrder/saveUserImageList',
                    payload: [
                      ...userImageList,
                      ...list
                    ]
                  })
                }
              }
            })
          })
        })
      }
    })
  }

  const handleDelete = (index) => {
    Taro.showModal({
      title: '确定删除',
      content: '是否删除该照片',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#FF6345',
      success: (res) => {
        if (res.confirm) {
          let cloneList = [...userImageList];
          cloneList.splice(index, 1);
          dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
          })
        }
      }
    })
  }

  const handleOprate = (index, type) => {
    let cloneList = [...userImageList];
    let item = cloneList[index];
    if (item.printNums <= 1 && type == 'substract') {
      return;
    }
    cloneList.splice(index, 1, {
      ...item,
      printNums: type == 'substract' ? (item.printNums - 1) : (item.printNums + 1)
    });
    dispatch({
      type: 'confirmOrder/saveUserImageList',
      payload: cloneList
    })
  }

  const handleGoPrint = () => {
    if (userImageList.length <= 0) {
      return Taro.showToast({
        title: '至少选择一张照片',
        icon: 'none'
      })
    }
    Taro.navigateTo({
      url: '/pages/confirmOrder/index'
    })
  }

  const handleGoEdit = (index) => {
    dispatch({
      type: 'confirmOrder/saveActiveIndex',
      payload: index
    })
    Taro.navigateTo({
      url: '/pages/imgEdit/index'
    })
  }

  const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + v.printNums }, 0);

  return (
    <View className="index">
      <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
      <View className="content">
        {
          userImageList.map((v, index) => {
            return (
              <View className="item">
                <Image onClick={handleDelete.bind(this, index)} src={deleteIcon} className="delete-icon" />
                <View className="item-body" onClick={handleGoEdit.bind(this, index)}>
                  <Image style={getImgStyle(v.imgInfo)} className="item-img" mode="widthFix" src={v.originPath} />
                </View>
                <View className="item-footer">
                  <View className="step-wrap">
                    <Image src={v.printNums <= 1 ? lessDisabledIcon : lessSelectIcon} onClick={handleOprate.bind(this, index, 'substract')} className="opration-btn" />
                    <View>{v.printNums}</View>
                    <Image src={plusSelectIcon} onClick={handleOprate.bind(this, index, 'add')} className="opration-btn" />
                  </View>
                </View>
              </View>
            )
          })
        }
        <View className="item choose-item" onClick={handleChoose}>
          <View className="item-body">
            <Image src={addPic} />
            添加照片
          </View>
          <View className="item-footer"></View>
        </View>
      </View>
      <View className="submit-wrap">
        <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
        <View className="submit-left">
          <Text onClick={handleChoose}>添加照片</Text>
          <Text>已选{userImageList.length}张</Text>
        </View>
        <View className="submit-right" onClick={handleGoPrint}>去打印</View>
      </View>
      <Dialog className="upload-dialog" title={`已上传${progress.completeNum}/${progress.totalNum}张`} visible={progress.visible}>
        <View>正在拼命上传中，请耐心等待哦～</View>
      </Dialog>
    </View>
  )
}

export default connect(({ confirmOrder }) => ({
  confirmOrder
}))(SelectPic);
