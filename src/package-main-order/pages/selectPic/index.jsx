import React, { useEffect, useRef } from 'react'
import groupBy from 'lodash/groupBy'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import styles from './index.module.less'
import { SELECT_WIDTH } from '@/utils/picContent'
import { CropImg, SafeArea, Upload } from '@/components'
import Base from '@/layout/Base'
import WidthCompressCanvas from '@/layout/WidthCompressCanvas'
import addPic from '@/images/cion_add_to@2x.png'
import deleteIcon from '@/images/icon_delete@2x.png'
import lessSelectIcon from '@/images/icon_Less_selected@2x.png'
import lessDisabledIcon from '@/images/icon_Less_disabled@2x.png'
import plusSelectIcon from '@/images/cion_plus_selected@2x.png'
import imgView from '@/utils/crop'
import day from 'dayjs';

const SelectPic = ({ dispatch, confirmOrder }) => {

    const { coupon, userImageList, proportion } = confirmOrder;

    const uploadRef = useRef();

    const onChange = (file, fileList) => {
        const totalNum = fileList.length;
        const completeNum = fileList.filter((v) => { return v.status == 'done' }).length;

        if (totalNum == completeNum) {
            const imgList = fileList.map((img) => {
                return {
                    ...img,
                    printNums: img.printNums || 1
                }
            })
            dispatch({
                type: 'confirmOrder/saveUserImageList',
                payload: imgList,
                expireTime: day().add(7, 'day').valueOf()
            })
        }
    }

    useEffect(() => {
        dispatch({
            type: 'confirmOrder/initUserImgList'
        })
    }, [])

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

        const group = groupBy(userImageList, (v) => {
            if (!v.cropInfo) {
                return 'empty'
            }
            if (v.cropInfo.blur && !v.cropInfo.ignoreBlur) {
                return 'blur';
            }
            return 'normal'
        })

        if (group?.blur?.length > 0) {
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
                            payload: [...(group.blur || []), ...(group.normal || [])]
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

                    const ImgView = new imgView({
                        src: v.originImage,
                        width: v.imgInfo.width,
                        height: v.imgInfo.height
                    })

                    const cropImage = ImgView.crop(v.cropInfo, {
                        contentWidth: v.imgInfo.width,
                        contentHeight: v.imgInfo.width / proportion,
                    })

                    return {
                        ...v,
                        cropImage: cropImage.cropUrl,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                imageUrl: v.originImage,
                                offsetX: 0,
                                offsetY: 0,
                                isBase: true,
                                ...cropImage
                            }
                        ]
                    }
                })
            }
        })
    }

    const editFinish = (res) => {
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: res
        })
    }

    const handleAddPic = () => {
        uploadRef.current.handleChoose();
    }

    const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + v.printNums }, 0);

    const contentStyle = {
        height: `${Taro.pxTransform(SELECT_WIDTH / proportion, 750)}`
    }

    return (
        <View className={styles['index']}>
            <View className={styles['header']}>显示区域即为打印区域，如需调整请点击图片</View>
            <View className={styles['content']}>
                {
                    userImageList.map((v, index) => {

                        const cropImgProps = {
                            onFinish: (cropInfo) => {
                                const cloneList = [...userImageList];
                                cloneList[index].cropInfo = {
                                    ...cloneList[index].cropInfo,
                                    ...cropInfo
                                };
                                editFinish(cloneList);
                            },
                            onIgnore: () => {
                                const cloneList = [...userImageList];
                                cloneList[index].cropInfo = {
                                    ...v.cropInfo,
                                    ignoreBlur: true
                                }
                                editFinish(cloneList);
                            },
                            showEdit: false,
                            onHandleEdit: () => {
                                Taro.eventCenter.off('editFinish');
                                Taro.eventCenter.on('editFinish', (res) => {
                                    editFinish(res);
                                })
                                dispatch({
                                    type: 'editimg/goEditImg',
                                    payload: {
                                        imgList: userImageList.map((v) => {
                                            return {
                                                ...v,
                                                proportion
                                            }
                                        }),
                                        defaultIndex: index
                                    }
                                })
                            },
                            onHandleChange: () => {
                                uploadRef.current.handleChoose({
                                    type: 'replace',
                                    index
                                });
                            },
                            className: styles['item-img'],
                            contentWidth: SELECT_WIDTH,
                            contentHeight: SELECT_WIDTH / proportion,
                            width: v.imgInfo.width,
                            height: v.imgInfo.height,
                            cropOption: v.cropInfo,
                            src: v.originImage
                        }

                        return (
                            <View className={styles['item']}>
                                <Image onClick={handleDelete.bind(this, index)} src={deleteIcon} className={styles['delete-icon']} />
                                <View className={styles['item-body']} style={contentStyle}>
                                    <CropImg {...cropImgProps} autoRotate />
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
                <Upload ref={uploadRef} onChange={onChange} limit={9} fileList={userImageList}>
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
                            <View className={styles['submit-left']} onClick={handleAddPic}>
                                <Text className={styles['submit-left-text']}>添加照片</Text>
                                <Text className={styles['submit-left-text']}>已选{userImageList.length}张</Text>
                            </View>
                            <View className={styles['submit-right']} onClick={handleGoPrint}>去打印</View>
                        </View>
                    )
                }}
            </SafeArea>
        </View>
    )
}

export default Base(
    WidthCompressCanvas(
        connect(({ confirmOrder, editimg }) => ({
            confirmOrder,
            editimg
        }))(SelectPic)
    )
)
