import React, { useState, useLayoutEffect, useRef } from 'react';
import { $ } from '@tarojs/extend';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { View, Image } from '@tarojs/components';

import './index.less';

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

export default (props) => {

    const [loading, setLoading] = useState(true);

    const wrapRef = useRef();

    const [imgInfo, setImgInfo] = useState({
        width: props.width || 640,
        height: props.height || 320
    });

    useLayoutEffect(() => {
        $(wrapRef.current).height().then((height) => {
            const calcHeight = (height * radio || wrapRef.current.clientHeight * radio);
            if (props.width && props.height) {
                if (props.height > calcHeight) {
                    setImgInfo({
                        width: props.width * (calcHeight / props.height),
                        height: calcHeight
                    })
                } else {
                    setImgInfo({
                        width: props.width,
                        height: props.height
                    })
                }
            }
            if (props.src && (!props.width || !props.height)) {
                Taro.getImageInfo({
                    src: props.src.replace('http://', 'https://'),
                    success: (res) => {
                        setImgInfo({
                            width: imgInfo.width,
                            height: (res.width / res.height) / imgInfo.width
                        })
                    }
                })
            }
        })
    }, [props.src, props.width, props.height])

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
        <View className="wy-lazy-wrap" ref={wrapRef}>
            <View className={classnames(props.className, 'wy-lazy-loading')} style={loadingStyle}></View>
            <Image src={props.src} style={imgStyle} onLoad={() => { setLoading(false) }} mode="aspectFit"/>
        </View>
    )
}
