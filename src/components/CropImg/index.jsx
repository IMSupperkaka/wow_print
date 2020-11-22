import React, { useState, useEffect, useMemo, useImperativeHandle,forwardRef } from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { Canvas, View, Image, Text } from '@tarojs/components'

import './index.less'
import { CropImgProvider, CropImgConsumer } from './context'
import Transition from '../Transition'
import { EDIT_WIDTH } from '../../utils/picContent'
import { fitImg, approach, computedBlur } from '../../utils/utils'

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

    const approachRotate = approach([0,-90,-180,-270,-360,90,180,270,360], cropOption.rotate);

    const { tWidth, tHeight } = useMemo(() => {
      return fitImg({
          ...imgInfo,
          contentWidth: EDIT_WIDTH,
          contentHeight: EDIT_WIDTH / proportion,
          deg: approachRotate
      });
    }, [imgInfo, approachRotate])

    const { translate, scale, rotate = 0, mirror = false } = cropOption || defaultCropOption;

    const scalea = width / EDIT_WIDTH;
    // 位移矩阵
    const translateMatrix = math.matrix([[1, 0, translate[0] * scalea / radio], [0, 1, translate[1] * scalea / radio], [0, 0, 1]]);
    // 缩放矩阵
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    // 旋转矩阵
    // a = Math.cos(deg); b = -Math.sin(deg); c = Math.sin(deg); d = Math.cos(deg); deg为旋转弧度 rotate / 180 * Math.PI
    const deg = rotate / 180 * Math.PI;
    const rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
    // 镜像矩阵
    // a = (1-k*k)/(k*k+1); b = 2k/(k*k+1); c = 2k/(k*k+1); d = (k*k-1)/(k*k+1); k为斜率
    // matrix(a,b,c,d,e,f);
    // math.matrix([[a, c, e], [b, d, f], [0, 0, 1])
    const mirrorMatrix = math.matrix([[-1, 0, 0], [0, 1, 0], [0, 0, 1]]);

    // 依次执行旋转 缩放 镜像 位移 顺序不能错
    let matrix = math.multiply(rotateMatrix, scaleMatrix);

    if (mirror) {
        matrix = math.multiply(mirrorMatrix, matrix);
    }

    matrix = math.multiply(translateMatrix, matrix)

    const transformStyle = {
        transformOrigin: '50% 50%',
        transform: `matrix(${matrix._data[0][0].toFixed(6)}, ${matrix._data[1][0].toFixed(6)}, ${matrix._data[0][1].toFixed(6)}, ${matrix._data[1][1].toFixed(6)}, ${matrix._data[0][2].toFixed(6)}, ${matrix._data[1][2].toFixed(6)})`,
        width: Taro.pxTransform(tWidth * scalea, 750),
        height: Taro.pxTransform(tHeight * scalea, 750)
    }

    const blur = useMemo(() => {
      return computedBlur({
          contentWidth: EDIT_WIDTH,
          contentHeight: EDIT_WIDTH / proportion,
          width: imgInfo.width,
          height: imgInfo.height,
          afterWidth: tWidth * scale,
          afterHieght: tHeight * scale,
          printWidth: 10,
          printHeight: 10 / (width / height)
      });
    }, [imgInfo, tWidth, tHeight])

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
