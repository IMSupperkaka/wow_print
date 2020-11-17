import React, { useState, useEffect, useMemo } from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import { CropImgProvider, CropImgConsumer } from './context'
import Transition from '../Transition'
import { EDIT_WIDTH } from '../../utils/picContent'
import { initImg, computedBlur } from '../../utils/utils'

let globalKey = 0;

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const defaultCropOption = {
    translate: [0, 0],
    scale: 1
}

const Img = React.memo((props) => {
    return <Image style={props.style} src={props.src} mode="widthFix" className="crop-image"/>
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
})

export {
    CropImgProvider
};

const CropImg = (props) => {

    const { width, height, src, className, style = {}, cropOption, imgInfo, showEdit = true, showIgnoreBtn = true, ...resetProps } = props;

    const [state, setState] = useState({
        ignoreBlur: cropOption?.ignoreBlur || false // 是否忽略模糊
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

    useEffect(() => {

        let timer = null;

        if (props.editVisible) {
            timer = setTimeout(() => {
                props.onHide();
            }, 7000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [props.editVisible])

    const toogleEdit = (e) => {

        e.preventDefault();
        e.stopPropagation();

        if (!showEdit) {
            return props.onHandleEdit();
        }

        if (props.editVisible) {
            props.onHide();
        } else {
            props.onShow();
        }
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
        width: Taro.pxTransform(fWidth * scalea, 750),
        height: Taro.pxTransform(fHeight * scalea, 750)
    }

    const blur = computedBlur({
        contentWidth: EDIT_WIDTH,
        contentHeight: EDIT_WIDTH / proportion,
        width: imgInfo.width,
        height: imgInfo.height,
        afterWidth: fWidth * scale,
        afterHieght: fHeight * scale,
        printWidth: 10,
        printHeight: 10 / (width / height)
    });

    const showBlur = blur && !state.ignoreBlur;

    const editVisible = props.editVisible && !showBlur;

    return (
        <View onClick={toogleEdit} style={{ width: Taro.pxTransform(width, 750), height: Taro.pxTransform(height, 750) }} {...resetProps} className={classNames('cropimg-wrap', className)}>
            <View className="mask-box">
                <Transition in={showBlur && showIgnoreBtn} timeout={300} classNames="bottom-top">
                    <View className="mask-bottom">
                        <View className="btn" onClick={handleIgnore}>忽略</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                </Transition>
                <Transition in={showBlur} timeout={300} classNames="fade-in">
                    <View className={classNames("mask-tips", showIgnoreBtn ? null : 'full-mask')}>
                        <Text>提示</Text>
                        <Text>图片模糊或过长哦~</Text>
                    </View>
                </Transition>
                <Transition in={editVisible} timeout={300} classNames="bottom-top">
                    <View className={`mask-bottom black`}>
                        <View className="btn" onClick={handleEdit}>调整</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                </Transition>
            </View>
            <Img style={{ ...transformStyle, ...style }} src={src}/>
        </View>
    )
}

export default (props) => {

    const [cropKey, setCropKey] = useState();

    useEffect(() => {
        setCropKey(++globalKey);
    }, [])

    return (
        <CropImgConsumer>
            {({ list = [], onShow, onHide }) => {
                const editVisible = list.includes(cropKey);
                return <CropImg {...props} list={list} onShow={() => { onShow(cropKey) }} onHide={() => { onHide(cropKey) }} editVisible={editVisible}/>
            }}
        </CropImgConsumer>
    )
}
