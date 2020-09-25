import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import './index.less'
import { computeCropUrl, getCropPosition } from '../../utils/utils'
import { uploadFile } from '../../services/upload'
import { list } from '../../services/address'
import Dialog from '../../components/Dialog'
import SafeArea from '../../components/SafeArea'
import addPic from '../../../images/cion_add_to@2x.png'
import deleteIcon from '../../../images/icon_delete@2x.png'
import lessSelectIcon from '../../../images/icon_Less_selected@2x.png'
import lessDisabledIcon from '../../../images/icon_Less_disabled@2x.png'
import plusSelectIcon from '../../../images/cion_plus_selected@2x.png'

const getImgStyle = (info) => {
    const contentWidth = 300;
    const contentHeight = 429;
    const { x, y, width, height, scale } = getCropPosition(info, contentWidth, contentHeight);
    return {
        transformOrigin: '0% 0%',
        transform: `translate3d(${Taro.pxTransform(-1 * x)}, ${Taro.pxTransform(-1 * y)}, 0) scale(${scale})`,
        width: Taro.pxTransform(width),
        height: Taro.pxTransform(height)
    }
}

const SelectPic = ({ dispatch, confirmOrder }) => {

    const { coupon, userImageList } = confirmOrder;

    const [progress, setProgress] = useState({
        visible: false,
        totalNum: 0,
        completeNum: 0
    })
    const handleChoose = () => {
        Taro.chooseImage({
            sizeType: ['original'],
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
                            success: (imgres) => {
                                const imgInfo = {
                                    ...imgres,
                                    origin: [0.5, 0.5],
                                    scale: 1,
                                    translate: [0, 0]
                                }
                                list.push({
                                    originPath: v,
                                    originImage: res.data,
                                    cropImage: computeCropUrl(res.data, { ...imgInfo, contentWidth: 582, contentHeight: 833 }),
                                    printNums: 1,
                                    imgInfo: imgInfo
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
        list().then(({ data }) => {
            if (data.data.length <= 0) {
                Taro.navigateTo({
                    url: `/pages/addressEdit/index?type=add&redirect=${encodeURIComponent('/pages/confirmOrder/index')}`
                })
            } else {
                Taro.navigateTo({
                    url: '/pages/confirmOrder/index'
                })
            }
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
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20) }} className="submit-wrap">
                            {
                                coupon.couponName &&
                                <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                            }
                            <View className="submit-left">
                                <Text onClick={handleChoose}>添加照片</Text>
                                <Text>已选{userImageList.length}张</Text>
                            </View>
                            <View className="submit-right" onClick={handleGoPrint}>去打印</View>
                        </View>
                    )
                }}
            </SafeArea>
            <Dialog className="upload-dialog" title={`已上传${progress.completeNum}/${progress.totalNum}张`} visible={progress.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectPic);
