import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import styles from './index.module.less'
import { SELECT_WIDTH } from '../../utils/picContent'
import { computeCropUrl, computedBlur } from '../../utils/utils'
import UploadCrop from '../../components/UploadCrop'
import SafeArea from '../../components/SafeArea'
import Upload from '../../components/Upload'
import { CropImgProvider } from '../../components/CropImg'
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

        let restList = [];

        const blurList = userImageList.map((img) => {

            const contentWidth = Math.min(img.imgInfo.width, img.imgInfo.height)

            const blur = computedBlur({
                contentWidth: contentWidth,
                contentHeight: contentWidth / proportion,
                width: img.imgInfo.width,
                height: img.imgInfo.height,
                afterWidth: img.imgInfo.width * img.cropInfo.scale,
                afterHieght: img.imgInfo.height * img.cropInfo.scale,
                printWidth: 10,
                printHeight: 10 / proportion
            }) && !img.cropInfo.ignoreBlur;
            if (!blur) {
                restList.push(img);
            }
            return blur ? img : false;
        }).filter(v => v);

        if (blurList.length > 0) {
            return Taro.showModal({
                title: '温馨提示',
                content: '图片存在模糊或太长的问题，建议调整，以免影响打印效果。无操作视为可以打印',
                confirmText: '确认打印',
                cancelText: '去调整',
                confirmColor: '#FF6345',
                success: (res) => {
                    if (res.confirm) {
                        goConfirmOrder();
                    } else {
                        dispatch({
                            type: 'confirmOrder/saveUserImageList',
                            payload: [...blurList, ...restList]
                        })
                    }
                }
            })
        }

        goConfirmOrder();
    }

    const goConfirmOrder = () => {
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList: userImageList.map((v) => {

                    const cropImage = computeCropUrl(v.originImage, { // 裁剪后地址
                        contentWidth: v.imgInfo.width,
                        contentHeight: v.imgInfo.width / proportion,
                        ...v.imgInfo
                    }, v.cropInfo)

                    return {
                        ...v,
                        cropImage
                    }
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
        height: `${Taro.pxTransform(SELECT_WIDTH / proportion, 750)}`
    }

    return (
        <CropImgProvider>
            <View className={styles['index']}>
                <View className={styles['header']}>显示区域即为打印区域，如需调整请点击图片</View>
                <View className={styles['content']}>
                    {
                        userImageList.map((v, index) => {
                            return (
                                <View className={styles['item']}>
                                    <Image onClick={handleDelete.bind(this, index)} src={deleteIcon} className={styles['delete-icon']} />
                                    <View className={styles['item-body']} onClick={handleGoEdit.bind(this, index)} style={contentStyle}>
                                        <UploadCrop
                                            limit={9}
                                            fileList={userImageList}
                                            showIndex={index}
                                            showEdit={false}
                                            editFinish={editFinish}
                                            onChange={onChange}
                                            className={styles['item-img']}
                                            width={SELECT_WIDTH}
                                            height={SELECT_WIDTH / proportion} />
                                    </View>
                                    <View className={styles['item-footer']}>
                                        <View className={styles['step-wrap']}>
                                            <Image src={v.printNums <= 1 ? lessDisabledIcon : lessSelectIcon} onClick={handleOprate.bind(this, index, 'substract')} className={styles['opration-btn']} />
                                            <View className={styles['step-value']}>{v.printNums}</View>
                                            <Image src={plusSelectIcon} onClick={handleOprate.bind(this, index, 'add')} className={styles['opration-btn']} />
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }
                    <Upload onChange={onChange} limit={9} fileList={userImageList}>
                        <View className={`${styles['item']} ${styles['choose-item']}`}>
                            <View className={styles['item-body']} style={contentStyle}>
                                <Image className={styles['select-icon']} src={addPic} />
                                添加照片
                            </View>
                            <View className={styles['item-footer']}></View>
                        </View>
                    </Upload>
                </View>
                <SafeArea>
                    {({ bottom }) => {
                        return (
                            <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className={styles['submit-wrap']}>
                                {
                                    coupon.couponName &&
                                    <View className={styles['freenums-tag']}>还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                                }
                                <View className={styles['submit-left']}>
                                    <Text className={styles['submit-left-text']}>添加照片</Text>
                                    <Text className={styles['submit-left-text']}>已选{userImageList.length}张</Text>
                                </View>
                                <View className={styles['submit-right']} onClick={handleGoPrint}>去打印</View>
                            </View>
                        )
                    }}
                </SafeArea>
            </View>
        </CropImgProvider>
    )
}

export default connect(({ confirmOrder, editimg }) => ({
    confirmOrder,
    editimg
}))(SelectPic);
