import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Canvas, Text } from '@tarojs/components';

import './index.less';
import { computeCropUrl, getCropPosition } from '../../utils/utils'
import deleteIcon from '../../../images/icon_delete／2@2x.png'
import leftActiveIcon from '../../../images/icon_active_left@2x.png'
import leftDisabledIcon from '../../../images/icon_disabled_left@2x.png'
import rightActiveIcon from '../../../images/icon_active_right@2x.png'
import rightDisabledIcon from '../../../images/icon_disabled_right@2x.png'

let lastTouch = null;
let store = {
    originScale: 1
};
const contentWidth = 582;
const contentHeight = 833;

const getImgwh = ({ width, height }, scale = 1) => {
    let imgWidth;
    let imgHeight;
    if (width / height <= contentWidth / contentHeight) {
        imgWidth = contentWidth;
        imgHeight = (height / width) * imgWidth;
    } else {
        imgHeight = contentHeight;
        imgWidth = (width / height) * imgHeight;
    }
    return {
        width: imgWidth * scale,
        height: imgHeight * scale
    }
}

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2), Math.pow(p2.y - p1.y), 2);
}

const ImgEdit = (props) => {

    const { dispatch, confirmOrder: { userImageList, activeIndex } } = props;

    const [IMG, setIMG] = useState(userImageList[activeIndex]);
    const [isTouch, setIsTouch] = useState(false);
    const [translate, setTranslate] = useState([]);
    const [scale, setScale] = useState(1);
    const [origin, setOrigin] = useState([]);

    useEffect(() => {
        setIMG(userImageList[activeIndex]);
    }, [activeIndex])

    const getOrigin = (p1, p2) => {
        const { width, height } = getImgwh(IMG.imgInfo);
        return [(p1.x + p2.x - translate[0]) / width, (p1.y + p2.y - translate[1]) / height];
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
        const { width, height } = getImgwh(IMG.imgInfo, scale);
        if (scale < 1) {
            Taro.vibrateShort();
        }
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
        const cloneList = [...userImageList];
        const imgInfo = {
            ...cloneList[activeIndex].imgInfo,
            translate: [resetx, resety],
            scale: resetScale,
            origin: origin
        }
        cloneList[activeIndex].imgInfo = imgInfo;
        cloneList[activeIndex].cropImage = computeCropUrl(IMG.originImage, { ...imgInfo, contentWidth: 582, contentHeight: 833 });
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

    const onImgLoad = () => {
        setTranslate(IMG.imgInfo.translate);
        setScale(IMG.imgInfo.scale);
        setOrigin(IMG.imgInfo.origin);
    }

    const { x, y, width, height, scale: fScale } = getCropPosition({
        ...IMG.imgInfo,
        translate: translate,
        scale: scale,
        origin: origin
    }, contentWidth, contentHeight);

    const imgStyle = {
        transformOrigin: '0% 0%',
        transform: `translate3d(${Taro.pxTransform(-1 * x)}, ${Taro.pxTransform(-1 * y)}, 0) scale(${fScale})`,
        width: Taro.pxTransform(width),
        height: Taro.pxTransform(height),
        transitionProperty: (isTouch || scale > 2) ? 'null' : 'all'
    }
    
    const activeLeftIcon = <Image onClick={oprate.bind(this, 'subtraction')} className="oprate-icon" src={leftActiveIcon} />;
    const disabledLeftIcon = <Image className="oprate-icon" src={leftDisabledIcon} />;
    const activeRightIcon = <Image onClick={oprate.bind(this, 'plus')} className="oprate-icon" src={rightActiveIcon} />;
    const disabledRightIcon = <Image className="oprate-icon" src={rightDisabledIcon} />;

    return (
        <View>
            <View className="edit-content">
                <View className="top-tip"># 双指拖动、缩放可调整打印范围 #</View>
                <View className="content-wrap">
                    <View className="mask"></View>
                    <Canvas canvasId='canvas' disableScroll={true} className="content" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}></Canvas>
                    <Image onLoad={onImgLoad} style={imgStyle} className="img" src={IMG.originPath} />
                </View>
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
