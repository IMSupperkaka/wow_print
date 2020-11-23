import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas } from '@tarojs/components';

import styles from './index.module.less';
import math from '../../utils/math'
import { fitImg, approach, throttle } from '../../utils/utils'
import { EDIT_WIDTH } from '../../utils/picContent'
import CropImg from '../../components/CropImg'
import deleteIcon from '../../../images/icon_delete／2@2x.png'
import mirrorIcon from '../../../images/icon_Mirror@3x.png'
import rotateIcon from '../../../images/icon_90Spin@2x.png'
import leftActiveIcon from '../../../images/icon_active_left@2x.png'
import leftDisabledIcon from '../../../images/icon_disabled_left@2x.png'
import rightActiveIcon from '../../../images/icon_active_right@2x.png'
import rightDisabledIcon from '../../../images/icon_disabled_right@2x.png'

let lastTouch = null;

let store = {
    originScale: 1
};

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const getTouchPosition = (touch) => {
    return {
        x: touch.x || touch.pageX || 0,
        y: touch.y || touch.pageY || 0,
    }
}

const getTouchsPosition = (touchs) => {
    let poristionList = [];
    for (let i = 0; i < touchs.length; i++) {
        poristionList.push(getTouchPosition(touchs[i]))
    }
    return poristionList;
}

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2), Math.pow(p2.y - p1.y), 2);
}

const getDeg = (startTouches, endTouches) => {
    const startDeg = Math.atan((startTouches[1].y - startTouches[0].y) / (endTouches[1].x - endTouches[0].x));
    const endDeg = Math.atan((endTouches[1].y - endTouches[0].y) / (endTouches[1].x - endTouches[0].x));
    return (endDeg - startDeg) / ( 2 * Math.PI) * 360;
}

const resetPosition = ({ imgInfo, contentWidth, contentHeight, scale, translate, rotate }) => {

    let resetx = translate[0];
    let resety = translate[1];
    let resetRotate = approach([0,-90,-180,-270,-360,90,180,270,360], rotate) % 360;

    const { fWidth, fHeight } = fitImg({
        ...imgInfo,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        deg: resetRotate
    })

    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const translateMatrix = math.matrix([[1, 0, translate[0]], [0, 1, translate[1]], [0, 0, 1]]);

    // 中心点坐标
    const centerPosition = math.matrix([0, 0, 1]);
    // 操作后中心点坐标
    const afterCenterPosition = math.multiply(translateMatrix, scaleMatrix, centerPosition);

    const limit = {
        x: (fWidth * scale - contentWidth) / 2,
        y: (fHeight * scale - contentHeight) / 2
    }

    if (Math.abs(afterCenterPosition._data[0]) > limit.x) {
        resetx = (afterCenterPosition._data[0] > 0 ? 1 : -1) * limit.x;
    }

    if (Math.abs(afterCenterPosition._data[1]) > limit.y) {
        resety = (afterCenterPosition._data[1] > 0 ? 1 : -1) * limit.y;
    }
    return {
        resetx,
        resety,
        resetRotate
    }
}

const ImgEdit = (props) => {

    const { dispatch, editimg: { imgList, activeIndex } } = props;
    const IMG = imgList[activeIndex];
    const contentWidth = EDIT_WIDTH;
    const contentHeight = EDIT_WIDTH / IMG.proportion;
    const [isTouch, setIsTouch] = useState(false);
    const [translate, setTranslate] = useState([0, 0]);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [mirror, setMirror] = useState(false);

    useEffect(() => {
        const currentImg = imgList[activeIndex];
        setTranslate(currentImg.cropInfo.translate);
        setScale(currentImg.cropInfo.scale);
        setRotate(currentImg.cropInfo.rotate || 0);
        setMirror(currentImg.cropInfo.mirror);
    }, [activeIndex])

    const onTouchStart = (e) => {
        lastTouch = getTouchsPosition(e.touches);
        setIsTouch(true);
        store.originTranslate = translate;
        store.originDeg = rotate;
        if (lastTouch.length >= 2) {
            store.hypotenuse = getDistance(lastTouch[0], lastTouch[1]);
            store.originScale = scale;
        }
    }

    const onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const touchPositionList = getTouchsPosition(e.touches)
        if (touchPositionList.length >= 2) { // 双指
            const hypotenuse = getDistance(touchPositionList[0], touchPositionList[1]);
            const newScale = store.originScale * (hypotenuse / store.hypotenuse);
            // 反三角函数计算弧度
            const deg = getDeg(lastTouch, touchPositionList) % 360;
            if (mirror) {
                setRotate(store.originDeg + deg);
            } else {
                setRotate(store.originDeg - deg);
            }
            setScale(newScale);
        } else {
            const dx = (touchPositionList[0].x - lastTouch[0].x) * radio;
            const dy = (touchPositionList[0].y - lastTouch[0].y) * radio;
            setTranslate([store.originTranslate[0] + dx, store.originTranslate[1] + dy]);
        }
    }

    const onTouchEnd = (e) => {
        let resetScale = scale;
        if (scale < 1) {
            resetScale = 1;
            Taro.vibrateShort();
        }
        if (scale > 3) {
            resetScale = 3;
            Taro.vibrateShort();
        }

        const { resetx, resety, resetRotate } = resetPosition({ imgInfo: IMG.imgInfo, contentWidth: contentWidth, contentHeight: contentHeight, translate, rotate, scale: resetScale });

        setIsTouch(false);
        setScale(resetScale);
        setRotate(resetRotate);
        setTranslate([resetx, resety]);
        const cloneList = [...imgList];
        cloneList[activeIndex].cropInfo = {
            ...cloneList[activeIndex].cropInfo,
            translate: [resetx, resety],
            scale: resetScale,
            rotate: resetRotate
        };
        Taro.eventCenter.trigger('editFinish', cloneList);
    }

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
        setRotate((rotate) => {
            const cloneList = [...imgList];
            const newRotate = mirror ? ((rotate || 0) + 90) % 360 : ((rotate || 0) - 90) % 360;
            const { resetx, resety } = resetPosition({ imgInfo: IMG.imgInfo, contentWidth: contentWidth, contentHeight: contentHeight, translate, rotate: newRotate, scale });
            setTranslate([resetx, resety]);
            cloneList[activeIndex].cropInfo = {
                ...cloneList[activeIndex].cropInfo,
                translate: [resetx, resety],
                rotate: newRotate
            };
            Taro.eventCenter.trigger('editFinish', cloneList);
            return newRotate;
        });
    }

    const handleMirror = () => {
        setMirror((mirror) => {
            const cloneList = [...imgList];
            cloneList[activeIndex].cropInfo = {
                ...cloneList[activeIndex].cropInfo,
                mirror: !mirror
            };
            Taro.eventCenter.trigger('editFinish', cloneList);
            return !mirror;
        });
    }

    const oprate = (type) => {
        dispatch({
            type: 'editimg/saveActiveIndex',
            payload: type == 'plus' ? activeIndex + 1 : activeIndex - 1
        })
    }

    const activeLeftIcon = <Image onClick={oprate.bind(this, 'subtraction')} className={styles['oprate-icon']} src={leftActiveIcon} />;
    const disabledLeftIcon = <Image className={styles['oprate-icon']} src={leftDisabledIcon} />;
    const activeRightIcon = <Image onClick={oprate.bind(this, 'plus')} className={styles['oprate-icon']} src={rightActiveIcon} />;
    const disabledRightIcon = <Image className={styles['oprate-icon']} src={rightDisabledIcon} />;

    const cropOption = {
        ...IMG.cropInfo,
        translate,
        scale: scale,
        rotate: rotate
    }

    const maskStyle = {
        borderWidth: `${Taro.pxTransform(104, 750)} ${Taro.pxTransform(84, 750)} calc(100vh - ${Taro.pxTransform(104, 750)} - ${Taro.pxTransform(contentHeight, 750)}) ${Taro.pxTransform(84, 750)}`
    }

    const contentStyle = {
        height: `${Taro.pxTransform(contentHeight, 750)}`
    }

    return (
        <View>
            <Canvas canvasId='canvas' disableScroll={true} className={styles['edit-canvas']} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}></Canvas>
            <View className={styles['edit-content']}>
                <View className={styles['top-tip']}># 单指拖动、双指缩放可调整打印范围 #</View>
                <View className={styles['content-wrap']}>
                    <View className={styles['mask']} style={maskStyle}></View>
                    <View style={contentStyle} className={styles['content']}></View>
                    <CropImg className={styles['img']} showIgnoreBtn={false} width={contentWidth} height={contentHeight} src={IMG.filePath || IMG.originImage} imgInfo={IMG.imgInfo} cropOption={cropOption} style={{ transitionProperty: !isTouch ? 'transform' : 'none' }} />
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
