import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import './index.less'
import { SELECT_WIDTH } from '../../utils/picContent'
import { list } from '../../services/address'
import UploadCrop from '../../components/UploadCrop';
import SafeArea from '../../components/SafeArea'
import CropImg from '../../components/CropImg'
import Upload from '../../components/Upload'
import addPic from '../../../images/cion_add_to@2x.png'
import deleteIcon from '../../../images/icon_delete@2x.png'
import lessSelectIcon from '../../../images/icon_Less_selected@2x.png'
import lessDisabledIcon from '../../../images/icon_Less_disabled@2x.png'
import plusSelectIcon from '../../../images/cion_plus_selected@2x.png'

const SelectPic = ({ dispatch, confirmOrder }) => {

    const { coupon, userImageList, proportion } = confirmOrder;

    const onChange = (file, fileList) => {
        const totalNum = fileList.length;
        const completeNum = fileList.filter((v) => { return v.status == 'done' }).length;

        if (totalNum == completeNum) {
            dispatch({
                type: 'confirmOrder/saveUserImageList',
                payload: fileList.map((img) => {
                    return {
                        ...img,
                        printNums: img.printNums || 1
                    }
                })
            })
        }
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
            type: 'imgEdit/goImgEdit',
            payload: {
                imgList: userImageList,
                defaultIndex: index
            }
        })
    }

    const editFinish = (res) => {
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: res
        })
    }

    const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + v.printNums }, 0);

    const contentStyle = {
        height: `${Taro.pxTransform(SELECT_WIDTH / proportion)}`
    }

    return (
        <View className="index">
            <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
            <View className="content">
                {
                    userImageList.map((v, index) => {
                        return (
                            <View className="item">
                                <Image onClick={handleDelete.bind(this, index)} src={deleteIcon} className="delete-icon" />
                                <View className="item-body" onClick={handleGoEdit.bind(this, index)} style={contentStyle}>
                                    <UploadCrop
                                        limit={9}
                                        fileList={userImageList}
                                        showIndex={index}
                                        showEdit={false}
                                        editFinish={editFinish}
                                        onChange={onChange}
                                        className="item-img"
                                        width={SELECT_WIDTH}
                                        height={SELECT_WIDTH / proportion} />
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
                <Upload onChange={onChange} limit={9} fileList={userImageList}>
                    <View className="item choose-item">
                        <View className="item-body" style={contentStyle}>
                            <Image src={addPic} />
                            添加照片
                        </View>
                        <View className="item-footer"></View>
                    </View>
                </Upload>
            </View>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className="submit-wrap">
                            {
                                coupon.couponName &&
                                <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                            }
                            <View className="submit-left">
                                <Text>添加照片</Text>
                                <Text>已选{userImageList.length}张</Text>
                            </View>
                            <View className="submit-right" onClick={handleGoPrint}>去打印</View>
                        </View>
                    )
                }}
            </SafeArea>
        </View>
    )
}

export default connect(({ confirmOrder, editimg }) => ({
    confirmOrder,
    editimg
}))(SelectPic);
