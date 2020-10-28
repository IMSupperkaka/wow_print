import React from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { View, Image } from '@tarojs/components'

import './index.less'
import { EDIT_WIDTH } from '../../utils/picContent'

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const getImageInfo = async (filePath) => {
    return new Promise((resolve) => {
        Taro.getImageInfo({
            src: filePath,
            success: (imgres) => {
                resolve(imgres);
            }
        })
    })
}

export default (props) => {

    const { width, height, src, className, style = {}, cropOption: { translate, scale, fWidth, fHeight, rotateMatrix }, ...resetProps } = props;
    
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

    return (
        <View style={{ width: Taro.pxTransform(width), height: Taro.pxTransform(height) }} {...resetProps} className={classNames('cropimg-wrap', className)}>
            <Image style={{ ...transformStyle, ...style }} src={src} mode="scaleToFill" />
        </View>
    )
}
