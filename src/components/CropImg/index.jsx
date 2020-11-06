import React, { useState, useEffect, useMemo } from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import Transition from '../Transition'
import { EDIT_WIDTH } from '../../utils/picContent'
import { initImg } from '../../utils/utils'

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const defaultCropOption = {
    translate: [0, 0],
    scale: 1
}

const Img = React.memo((props) => {
    return <Image style={props.style} src={props.src} mode="widthFix" />
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
})

export default (props) => {

    const { width, height, src, className, style = {}, cropOption, imgInfo, showEdit = true, showIgnoreBtn = true, ...resetProps } = props;

    const [state, setState] = useState({
        ignoreBlur: cropOption?.ignoreBlur || false, // 是否忽略模糊
        edit: false
    });

    const [initImgInfo, setInitImgInfo] = useState({
        fWidth: 0
    });

    useEffect(() => {
        const info = initImg({
            ...imgInfo,
            origin: [0.5, 0.5],
            scale: 1,
            translate: [0, 0]
        }, { width: EDIT_WIDTH, height: EDIT_WIDTH / proportion });
        setInitImgInfo(info);
    }, [imgInfo])

    useEffect(() => {
        setState((state) => {
            return {
                ...state,
                ignoreBlur: cropOption.ignoreBlur
            }
        })
    }, [cropOption])

    const toogleEdit = () =>{

        if (!showEdit) {
            return props.onHandleEdit();
        }

        setState((state) => {
            return {
                ...state,
                edit: !state.edit
            }
        })
    }

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onHandleEdit();
    }

    const handleChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onHandleChange();
    }

    const handleIgnore = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onIgnore();
    }

    const proportion = width / height;

    if (initImgInfo.fWidth <= 0) {
        return <View>Loading...</View>;
    }

    const { fWidth, fHeight, rotateMatrix } = initImgInfo;
    const { translate, scale } = cropOption || defaultCropOption;

    const scalea = width / EDIT_WIDTH;
    const translateMatrix = math.matrix([[1, 0, translate[0] * scalea / radio], [0, 1, translate[1] * scalea / radio], [0, 0, 1]]);
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const matrix = math.multiply(scaleMatrix, translateMatrix, rotateMatrix);

    const transformStyle = {
        transformOrigin: '50% 50%',
        transform: `matrix(${matrix._data[0][0]}, ${matrix._data[1][0]}, ${matrix._data[0][1]}, ${matrix._data[1][1]}, ${matrix._data[0][2]}, ${matrix._data[1][2]})`,
        width: Taro.pxTransform(fWidth * scalea),
        height: Taro.pxTransform(fHeight * scalea)
    }

    // 总像素
    const totalPixels = imgInfo.width * imgInfo.height;
    // 剪裁区域占图片大小比例
    const place = (width * height) / (fWidth * fHeight * scale * scale);
    // 显示的总像素
    const displayPixels = totalPixels * place;
    // 一个逻辑像素所表达的物理像素比
    const pixelsRate = displayPixels / (width * height);
    // 当一个逻辑像素表达的物理像素小于1/3时 定义为图片模糊
    const blur = pixelsRate < 0.33333;

    const showBlur = blur && !state.ignoreBlur;

    return (
        <View onClick={toogleEdit} style={{ width: Taro.pxTransform(width), height: Taro.pxTransform(height) }} {...resetProps} className={classNames('cropimg-wrap', className)}>
            <View className="mask-box">
                {
                    <Transition in={showBlur && showIgnoreBtn} timeout={0} classNames="bottom-top">
                        <View className="mask-bottom">
                            <View className="btn" onClick={handleIgnore}>忽略</View>
                            <View className="line" />
                            <View className="btn" onClick={handleChange}>换图</View>
                        </View>
                    </Transition>
                }
                {
                    <Transition in={showBlur} timeout={0} classNames="fade-in">
                        <View className={classNames("mask-tips", showIgnoreBtn ? null : 'full-mask')}>
                            <Text>提示</Text>
                            <Text>图片模糊或过长哦~</Text>
                        </View>
                    </Transition>
                }
                {
                    showEdit &&
                    <Transition in={state.edit && !showBlur} timeout={0} classNames="bottom-top">
                        <View className={`mask-bottom black`}>
                            <View className="btn" onClick={handleEdit}>调整</View>
                            <View className="line" />
                            <View className="btn" onClick={handleChange}>换图</View>
                        </View>
                    </Transition>
                }
            </View>
            <Img style={{ ...transformStyle, ...style }} src={src}/>
        </View>
    )
}
