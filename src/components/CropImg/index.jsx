import React, { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import Transition from '../Transition'
import { useCrop, useClickOutside, useCacheImage } from '@/hooks'

const CropImg = (props) => {

    const { width, height, contentWidth, contentHeight, src, style = {}, className, useProps, animate, autoRotate = false, cropOption, onFinish, showEdit = true, showIgnoreBtn = true, ...restProps } = props;

    const [editVisible, setEditVisible] = useState(false);

    const cropRef = useRef();

    const { cachePath } = useCacheImage(src);

    const {
        state: {
            blur
        },
        style: cropStyle,
        mutate
    } = useCrop({
        width: width,
        height: height,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        animate,
        autoRotate,
        onFinish,
        ...cropOption
    });

    useClickOutside((e) => {
        setEditVisible(false);
    }, cropRef)

    useEffect(() => {
        if (!useProps) {
            mutate({
                width,
                height,
                contentWidth: contentWidth,
                contentHeight: contentHeight,
                animate,
                ...cropOption
            })
        }
    }, [width, height, contentWidth, contentHeight, cropOption, animate])

    useEffect(() => {

        let timer = null;

        if (editVisible) {
            timer = setTimeout(() => {
                setEditVisible(false);
            }, 7000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [editVisible])

    const toogleEdit = (e) => {

        if (!showEdit) {
            return props.onHandleEdit?.();
        }

        setEditVisible((visible) => {
            return !visible;
        })
    }

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props?.onHandleEdit();
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

    const showBlur = blur && !cropOption.ignoreBlur;

    const transformStyle = useProps ? props.transformStyle : cropStyle.transformStyle;

    const onClick = (e) => {
        toogleEdit(e);
    }

    console.log(transformStyle);

    return (
        <View ref={cropRef} onClick={onClick} style={{ width: Taro.pxTransform(contentWidth, 750), height: Taro.pxTransform(contentHeight, 750), ...style }} className={classNames('cropimg-wrap', className)} {...restProps}>
            <View className="mask-box">
                <Transition in={showBlur && showIgnoreBtn} timeout={300} classNames="bottom-top">
                    <View className="mask-bottom">
                        <View className="btn" onClick={handleIgnore}>忽略</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                </Transition>
                <Transition in={showBlur && showIgnoreBtn} timeout={300} classNames="fade-in">
                    <View className={classNames("mask-tips", showIgnoreBtn ? null : 'full-mask')}>
                        <Text>提示</Text>
                        <Text>图片模糊或过长哦~</Text>
                    </View>
                </Transition>
                <Transition in={editVisible && !showBlur} timeout={300} classNames="bottom-top">
                    <View className={`mask-bottom black`}>
                        <View className="btn" onClick={handleEdit}>调整</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                </Transition>
            </View>
            <View className="crop-img-box">
                <Image style={transformStyle} src={cachePath} mode="widthFix" className="crop-image" />
            </View>
        </View>
    )
}

export default CropImg
