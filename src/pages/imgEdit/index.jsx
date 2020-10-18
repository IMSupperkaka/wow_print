import React, { useState, useReducer, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas, Text, Swiper, SwiperItem } from '@tarojs/components';

import './index.less';
import math from '../../utils/math'
import { computeCropUrl, getCropPosition } from '../../utils/utils'
import { EDIT_WIDTH } from '../../utils/picContent'
import deleteIcon from '../../../images/icon_delete／2@2x.png'
import leftActiveIcon from '../../../images/icon_active_left@2x.png'
import leftDisabledIcon from '../../../images/icon_disabled_left@2x.png'
import rightActiveIcon from '../../../images/icon_active_right@2x.png'
import rightDisabledIcon from '../../../images/icon_disabled_right@2x.png'

let lastTouch = null;
let store = {
    originScale: 1
};

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2), Math.pow(p2.y - p1.y), 2);
}

const Img = ({ path, imgInfo, onLoad, animate }) => {

    const { rotateMatrix, translate, scale } = imgInfo;
    const translateMatrix = math.matrix([[1, 0, translate[0] / radio], [0, 1, translate[1] / radio], [0, 0, 1]]);
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const matrix = math.multiply(scaleMatrix, translateMatrix, rotateMatrix);

    const imgStyle = {
        transform: `matrix(${matrix._data[0][0]}, ${matrix._data[1][0]}, ${matrix._data[0][1]}, ${matrix._data[1][1]}, ${matrix._data[0][2]}, ${matrix._data[1][2]})`,
        transitionProperty: animate ? 'transform' : 'none',
        width: Taro.pxTransform(imgInfo.fWidth),
        height: Taro.pxTransform(imgInfo.fHeight)
    }

    return (
        <Image onLoad={onLoad} style={imgStyle} className="img" src={path} />
    )
}

const ImgEdit = (props) => {

    const { dispatch, confirmOrder: { proportion, userImageList, activeIndex } } = props;
    const contentWidth = EDIT_WIDTH;
    const contentHeight = EDIT_WIDTH / proportion;
    const [IMG, setIMG] = useState(userImageList[activeIndex]);
    const [isTouch, setIsTouch] = useState(false);
    const [translate, setTranslate] = useState([0, 0]);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const current = userImageList[activeIndex];
        setIMG(current);
        setTranslate(current.imgInfo.translate);
        setScale(current.imgInfo.scale);
    }, [activeIndex])

    const onTouchStart = (e) => {
        lastTouch = e.touches;
        setIsTouch(true);
        store.originScale = scale;
        store.originTranslate = translate;
    }

    const onTouchMove = (e) => {
        if (e.touches.length >= 2) {
            const zoom = getDistance(e.touches[0], e.touches[1]) / getDistance(lastTouch[0], lastTouch[1]);
            const newScale = store.originScale * zoom;
            setScale(newScale);
        } else {
            const dx = (e.touches[0].x - lastTouch[0].x) * radio;
            const dy = (e.touches[0].y - lastTouch[0].y) * radio;
            setTranslate([store.originTranslate[0] + dx, store.originTranslate[1] + dy]);
        }
    }

    const onTouchEnd = (e) => {
        const [dx, dy] = translate;
        let resetScale = scale;
        const { fWidth, fHeight } = IMG.imgInfo;
        if (scale < 1) {
            resetScale = 1;
            Taro.vibrateShort();
        }
        if (scale > 3) {
            resetScale = 3;
            Taro.vibrateShort();
        }
        let resetx = dx;
        let resety = dy;

        const { rotateMatrix } = IMG.imgInfo;
        const scaleMatrix = math.matrix([[resetScale, 0, 0], [0, resetScale, 0], [0, 0, 1]]);
        const translateMatrix = math.matrix([[1, 0, translate[0] * 1], [0, 1, translate[1] * 1], [0, 0, 1]]);
        const leftTop = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, math.matrix([0, 0, 1]));
        const rightBottom = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, math.matrix([fWidth, fHeight, 1]));

        if (leftTop._data[0] > 0) { // 左侧有空隙
            resetx = 0;
        }
        if (leftTop._data[1] > 0) { // 上侧有空隙
            resety = 0;
        }
        if (rightBottom._data[0] < contentWidth) { // 右侧有空隙
            resetx = contentWidth / resetScale - fWidth;
        }
        if (rightBottom._data[1] < contentHeight) { // 下侧有空隙
            resety = contentHeight / resetScale - fHeight;
        }

        setIsTouch(false);
        setScale(resetScale);
        setTranslate([resetx, resety]);
        const cloneList = [...userImageList];
        const imgInfo = {
            ...cloneList[activeIndex].imgInfo,
            translate: [resetx, resety],
            scale: resetScale,
            origin: origin
        }
        cloneList[activeIndex].imgInfo = imgInfo;
        cloneList[activeIndex].cropImage = computeCropUrl(IMG.originImage, { ...imgInfo, contentWidth: EDIT_WIDTH, contentHeight: EDIT_WIDTH / proportion });
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
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
                    const cloneList = [...userImageList];
                    cloneList.splice(activeIndex, 1);
                    if (cloneList.length <= 0) {
                        Taro.navigateBack();
                    } else {
                        oprate(activeIndex <= 0 ? 'plus' : 'subtraction');
                    }
                    dispatch({
                        type: 'confirmOrder/saveUserImageList',
                        payload: cloneList
                    })
                }
            }
        })
    }

    const oprate = (type) => {
        dispatch({
            type: 'confirmOrder/saveActiveIndex',
            payload: type == 'plus' ? activeIndex + 1 : activeIndex - 1
        })
    }

    const activeLeftIcon = <Image onClick={oprate.bind(this, 'subtraction')} className="oprate-icon" src={leftActiveIcon} />;
    const disabledLeftIcon = <Image className="oprate-icon" src={leftDisabledIcon} />;
    const activeRightIcon = <Image onClick={oprate.bind(this, 'plus')} className="oprate-icon" src={rightActiveIcon} />;
    const disabledRightIcon = <Image className="oprate-icon" src={rightDisabledIcon} />;

    const imgInfo = {
        ...IMG.imgInfo,
        translate,
        scale
    }

    const maskStyle = {
      borderWidth: `${Taro.pxTransform(102)} ${Taro.pxTransform(84)} calc(100vh - ${Taro.pxTransform(102)} - ${Taro.pxTransform(EDIT_WIDTH / proportion)}) ${Taro.pxTransform(84)}`
    }

    const contentStyle = {
      height: `${Taro.pxTransform(EDIT_WIDTH / proportion)}`
    }

    return (
        <View>
            <View className="edit-content">
                <View className="top-tip"># 单指拖动、双指缩放可调整打印范围 #</View>
                <View className="content-wrap">
                    <View className="mask" style={maskStyle}></View>
                    <Canvas canvasId='canvas' style={contentStyle} disableScroll={true} className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}></Canvas>
                    <Img animate={!isTouch} path={IMG.originPath} imgInfo={imgInfo} />
                </View>
                <View className="bottom-wrap">
                    <View className="bottom-tip">tips：灰色区域将被裁剪，不在打印范围内</View>
                    <View>
                        {
                            activeIndex <= 0 ?
                                disabledLeftIcon :
                                activeLeftIcon
                        }
                        {
                            activeIndex >= userImageList.length - 1 ?
                                disabledRightIcon :
                                activeRightIcon
                        }
                    </View>
                </View>
            </View>
            <View className="bottom-bar">
                <View onClick={handleDelete}><Image className="delete" src={deleteIcon} /></View>
                <View onClick={confirm}>完成</View>
            </View>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(ImgEdit);
