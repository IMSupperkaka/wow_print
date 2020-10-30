import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import { EDIT_WIDTH } from '../../utils/picContent'
import { computeCropUrl, initImg } from '../../utils/utils'

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

export default (props) => {

    const { width, height, src, className, style = {}, imgInfo, cropOption = {}, ...resetProps } = props;

    const [state, setState] = useState({
        blur: false,
        ignore: false,
        edit: false
    });

    const [initImgInfo, setInitImgInfo] = useState({
        fWidth: 0
    });

    const proportion = width / height;

    useEffect(() => {
        const info = initImg({
            ...imgInfo,
            origin: [0.5, 0.5],
            scale: 1,
            translate: [0, 0]
        }, { width: EDIT_WIDTH, height: EDIT_WIDTH / proportion });
        setInitImgInfo(info);
    }, [imgInfo])

    if (initImgInfo.fWidth <= 0) {
        return <View>Loading...</View>;
    }

    const { fWidth, fHeight, rotateMatrix } = initImgInfo;
    const { translate = [0, 0], scale = 1 } = cropOption;

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

    const toogleEdit = () =>{
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

    return (
        <View onClick={toogleEdit} style={{ width: Taro.pxTransform(width), height: Taro.pxTransform(height) }} {...resetProps} className={classNames('cropimg-wrap', className)}>
            <View className="mask-box">
                {
                    state.blur && !state.ignore &&
                    <>
                        <View className="mask-bottom">
                            <View className="btn">忽略</View>
                            <View className="line" />
                            <View className="btn">换图</View>
                        </View>
                        <View className="mask-tips">
                            <Text>提示</Text>
                            <Text>图片模糊或过长哦~</Text>
                        </View>
                    </>
                }
                {
                    state.edit &&
                    <View className="mask-bottom black">
                        <View className="btn" onClick={handleEdit}>调整</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                }
            </View>
            <Image style={{ ...transformStyle, ...style }} src={src} mode="widthFix" />
        </View>
    )
}
