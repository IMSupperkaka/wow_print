import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { View, Image } from '@tarojs/components';

import './index.less';

export default (props) => {

    const [loading, setLoading] = useState(true);

    const [imgInfo, setImgInfo] = useState({
        width: props.width || 640,
        height: props.height || 320
    });

    useEffect(() => {
        Taro.getImageInfo({
            src: props.src.replace('http://', 'https://'),
            success: (res) => {
                setImgInfo({
                    width: imgInfo.width,
                    height: imgInfo.width / (res.width / res.height)
                })
            }
        })
    }, [])

    const loadingStyle = {
        width: Taro.pxTransform(imgInfo.width, 750),
        height: Taro.pxTransform(imgInfo.height, 750),
        display: loading ? 'block' : 'none'
    }

    const imgStyle = {
        width: Taro.pxTransform(imgInfo.width, 750),
        height: Taro.pxTransform(imgInfo.height, 750),
        transition: 'height .2s ease-in-out',
        opacity: loading ? 0 : 1
    }

    return (
        <View className="wy-lazy-wrap">
            <View className={classnames(props.className, 'wy-lazy-loading')} style={loadingStyle}></View>
            <Image src={props.src} style={imgStyle} onLoad={() => { setLoading(false) }}/>
        </View>
    )
}
