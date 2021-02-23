import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas } from '@tarojs/components';

import styles from './index.module.less';
import { EDIT_WIDTH } from '@/utils/picContent'
import CropImg from '@/components/CropImg'
import useCrop from '../../hooks/useCrop'
import deleteIcon from '@/images/icon_delete／2@2x.png'
import mirrorIcon from '@/images/icon_Mirror@3x.png'
import rotateIcon from '@/images/icon_90Spin@2x.png'
import leftActiveIcon from '@/images/icon_active_left@2x.png'
import leftDisabledIcon from '@/images/icon_disabled_left@2x.png'
import rightActiveIcon from '@/images/icon_active_right@2x.png'
import rightDisabledIcon from '@/images/icon_disabled_right@2x.png'

const ImgEdit = (props) => {

    const { dispatch, editimg: { imgList, activeIndex } } = props;
    const IMG = imgList[activeIndex];

    if (!IMG) {
        return null;
    }

    const contentWidth = EDIT_WIDTH;
    const contentHeight = EDIT_WIDTH / IMG.proportion;

    const {
        state,
        mutate,
        touchProps,
        cropProps
    } = useCrop({
        width: IMG.imgInfo.width,
        height: IMG.imgInfo.height,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        ...IMG.imgInfo.cropInfo,
        forcefit: ['translate', 'rotate'],
        onFinish: (cropInfo) => {
            const cloneList = [...imgList];
            cloneList[activeIndex].cropInfo = {
                ...cloneList[activeIndex].cropInfo,
                ...cropInfo
            };
            Taro.eventCenter.trigger('editFinish', cloneList);
        }
    });

    useEffect(() => {
        const currentImg = imgList[activeIndex];
        mutate({
            translate: currentImg.cropInfo.translate,
            scale: currentImg.cropInfo.scale,
            rotate: currentImg.cropInfo.rotate || 0,
            mirror: currentImg.cropInfo.mirror || false,
            width: IMG.imgInfo.width,
            height: IMG.imgInfo.height,
        })
    }, [activeIndex])

    const confirm = () => {
        Taro.navigateBack();
    }

    const handleDelete = () => {
        Taro.showModal({
            title: '确定删除',
            content: '是否删除该照片',
            confirmText: '确定',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    dispatch({
                        type: 'editimg/deleteImg',
                        payload: {
                            index: activeIndex
                        }
                    })
                }
            }
        })
    }

    const handleRotate = () => {
        mutate({
            rotate: state.mirror ? ((state.rotate || 0) + 90) % 360 : ((state.rotate || 0) - 90) % 360
        })
    }

    const handleMirror = () => {
        mutate({
            mirror: !state.mirror
        })
    }

    const oprate = (type) => {
        dispatch({
            type: 'editimg/saveActiveIndex',
            payload: type == 'plus' ? (activeIndex + 1) : (activeIndex - 1)
        })
    }

    const activeLeftIcon = <Image onClick={oprate.bind(this, 'subtraction')} className={styles['oprate-icon']} src={leftActiveIcon} />;
    const disabledLeftIcon = <Image className={styles['oprate-icon']} src={leftDisabledIcon} />;
    const activeRightIcon = <Image onClick={oprate.bind(this, 'plus')} className={styles['oprate-icon']} src={rightActiveIcon} />;
    const disabledRightIcon = <Image className={styles['oprate-icon']} src={rightDisabledIcon} />;

    const position = {
        left: Taro.pxTransform(84, 750),
        right: `calc(100% - ${Taro.pxTransform(84, 750)})`,
        top: Taro.pxTransform(104, 750),
        bottom: `calc(${Taro.pxTransform(104, 750)} + ${Taro.pxTransform(contentHeight, 750)})`
    }

    const maskStyle = {
        background: 'rgba(0,0,0,.5)',
        // borderWidth: `${Taro.pxTransform(104, 750)} ${Taro.pxTransform(84, 750)} calc(100vh - ${Taro.pxTransform(104, 750)} - ${Taro.pxTransform(contentHeight, 750)}) ${Taro.pxTransform(84, 750)}`
        clipPath: `polygon(100% 0%, 100% 100%, 0 100%, 0 ${position.bottom}, ${position.right} ${position.bottom}, ${position.right} ${position.top}, ${position.left} ${position.top}, ${position.left} ${position.bottom}, 0% ${position.bottom},0% 0%)`,
    }

    const contentStyle = {
        height: `${Taro.pxTransform(contentHeight, 750)}`
    }

    return (
        <View>
            <View className={styles['edit-content']}>
                <View className={styles['top-tip']}># 单指拖动、双指缩放可调整打印范围 #</View>
                <View className={styles['content-wrap']}>
                    <View className={styles['mask']} style={maskStyle}></View>
                    <View style={contentStyle} className={styles['content']}></View>
                    <CropImg className={styles['img']} showIgnoreBtn={false} src={IMG.originImage} {...cropProps} />
                    <Canvas style={contentStyle} canvasId='canvas' disableScroll={true} className={styles['edit-canvas']} {...touchProps}></Canvas>
                </View>
                <View className={styles['bottom-wrap']}>
                    <View className={styles['bottom-tip']}>tips：灰色区域将被裁剪，不在打印范围内</View>
                    {
                        imgList.length > 1 &&
                        <View>
                            {
                                activeIndex <= 0 ?
                                    disabledLeftIcon :
                                    activeLeftIcon
                            }
                            {
                                activeIndex >= imgList.length - 1 ?
                                    disabledRightIcon :
                                    activeRightIcon
                            }
                        </View>
                    }
                </View>
            </View>
            <View className={styles['bottom-bar']}>
                <View className={styles['bottom-bar-left']} onClick={handleDelete}>
                    <Image className={styles['icon']} src={deleteIcon} />
                </View>
                <View className={styles['bottom-bar-left']} onClick={handleRotate}>
                    <Image className={styles['icon']} src={rotateIcon} />
                </View>
                <View className={styles['bottom-bar-left']} onClick={handleMirror}>
                    <Image className={styles['icon']} src={mirrorIcon} />
                </View>
                <View className={styles['bottom-bar-confirm']} onClick={confirm}>完成</View>
            </View>
        </View>
    )
}

export default connect(({ editimg }) => ({
    editimg
}))(ImgEdit);
