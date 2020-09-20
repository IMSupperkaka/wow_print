import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas, Text } from '@tarojs/components';

import './index.less';
import deleteIcon from '../../../images/icon_delete／2@2x.png'

let lastTouch = null;
let store = {
    originScale: 1
};
const contentWidth = 582;
const contentHeight = 833;

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2), Math.pow(p2.y - p1.y), 2);
}

const ImgEdit = (props) => {

    const { dispatch, confirmOrder: { userImageList, activeIndex } } = props;
    const IMG = userImageList[activeIndex];
    const [isTouch, setIsTouch] = useState(false);
    const [translate, setTranslate] = useState(IMG.imgInfo.translate);
    const [scale, setScale] = useState(IMG.imgInfo.scale);
    const [origin, setOrigin] = useState(IMG.imgInfo.origin);

    const getImgWh = ({ height, width }) => {
        let imgWidth;
        let imgHeight;
        if (width / height <= contentWidth / contentHeight) {
            imgWidth = contentWidth * scale;
            imgHeight = (height / width) * imgWidth;
        } else {
            imgHeight = contentHeight * scale;
            imgWidth = (width / height) * imgHeight;
        }
        return {
            width: imgWidth,
            height: imgHeight
        }
    }

    const getOrigin = (p1, p2) => {
        const { width, height } = getImgWh(IMG.imgInfo);
        return [(p1.x + p2.x) / width, (p1.y + p2.y) / height];
    }

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
            const neworigin = getOrigin(e.touches[0], e.touches[1]);
            setOrigin([neworigin[0], neworigin[1]]);
            setScale(newScale);
        } else {
            const dx = e.touches[0].x - lastTouch[0].x;
            const dy = e.touches[0].y - lastTouch[0].y;
            setTranslate([store.originTranslate[0] + dx, store.originTranslate[1] + dy]);
        }
    }

    const onTouchEnd = (e) => {
        const [dx, dy] = translate;
        const resetScale = scale < 1 ? 1 : scale;
        if (scale < 1) {
            Taro.vibrateShort();
        }
        const { width, height } = getImgWh(IMG.imgInfo);
        const limitLeft = (width - contentWidth) * origin[0];
        const limitRight = -(width - contentWidth) * (1 - origin[0]);
        const limitTop = (height - contentHeight) * origin[1];
        const limitBottom = -(height - contentHeight) * (1 - origin[1]);
        let resetx = dx;
        let resety = dy;
        if (dx > 0 && dx > limitLeft) {
            resetx = limitLeft;
        }
        if (dx < 0 && dx < limitRight) {
            resetx = limitRight;
        }
        if (dy > 0 && dy > limitTop) {
            resety = limitTop;
        }
        if (dy < 0 && dy < limitBottom) {
            resety = limitBottom;
        }
        setIsTouch(false);
        setScale(resetScale);
        setTranslate([resetx, resety]);
    }

    const confirm = () => {
        const cloneList = [...userImageList];
        cloneList[activeIndex].imgInfo = {
            ...cloneList[activeIndex].imgInfo,
            translate: translate,
            scale: scale,
            origin: origin
        }
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
        Taro.navigateBack();
    }

    const handleDelete = () => {
        const cloneList = [...userImageList];
        cloneList.splice(activeIndex, 1);
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
        Taro.navigateBack();
    }

    const { width, height } = getImgWh(IMG.imgInfo);
    const offsetX = width - contentWidth;
    const offsetY = height - contentHeight;
    const percentx = translate[0] - origin[0] * offsetX;
    const percenty = translate[1] - origin[1] * offsetY;

    const imgStyle = {
        transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`,
        transform: `translate3d(${Taro.pxTransform(percentx)}, ${Taro.pxTransform(percenty)}, 0) scale(${scale})`,
        width: Taro.pxTransform(width),
        height: Taro.pxTransform(height),
        transitionProperty: (isTouch || scale > 2) ? 'null' : 'transform'
    }

    return (
        <View>
            <View className="edit-content">
                <View className="mask"></View>
                <View className="top-tip"># 双指拖动、缩放可调整打印范围 #</View>
                <View className="content-wrap">
                    <Canvas canvasId='canvas' disableScroll={true} className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}></Canvas>
                    <Image style={imgStyle} className="img" src={IMG.originPath} />
                </View>
                <View className="bottom-tip">tips：灰色区域将被裁剪，不在打印范围内</View>
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
}))(ImgEdit);;
