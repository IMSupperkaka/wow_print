import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import Taro from '@tarojs/taro'
import math from '../../utils/math'
import classNames from 'classnames'
import { View, Image, Text } from '@tarojs/components'

import './index.less'
import { CropImgProvider, CropImgConsumer } from './context'
import Transition from '../Transition'
import useCrop from '../../hooks/useCrop'

let globalKey = 0;

const Img = React.memo((props) => {
    return <Image style={props.style} src={props.src} mode="widthFix" className="crop-image" {...props} />
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
})

export {
    CropImgProvider
};

const CropImg = (props) => {

    const { width, height, contentWidth, contentHeight, src, style = {}, className, useProps, animate, cropOption, showEdit = true, showIgnoreBtn = true, ...restProps } = props;

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
        ...cropOption
    });

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

    const showBlur = blur && !cropOption.ignoreBlur;

    const editVisible = props.editVisible && !showBlur;

    const transformStyle = useProps ? props.transformStyle : cropStyle.transformStyle;

    const onClick = (e) => {
        if (showIgnoreBtn) {
            e.preventDefault();
            e.stopPropagation();
        }
        toogleEdit(e);
    }

    return (
        <View onClick={onClick} style={{ width: Taro.pxTransform(contentWidth, 750), height: Taro.pxTransform(contentHeight, 750), ...style }} className={classNames('cropimg-wrap', className)} {...restProps}>
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
                <Transition in={editVisible} timeout={300} classNames="bottom-top">
                    <View className={`mask-bottom black`}>
                        <View className="btn" onClick={handleEdit}>调整</View>
                        <View className="line" />
                        <View className="btn" onClick={handleChange}>换图</View>
                    </View>
                </Transition>
            </View>
            <View className="crop-img-box">
                <Img style={transformStyle} src={src} />
            </View>
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
                return <CropImg {...props} list={list} onShow={() => { onShow && onShow(cropKey) }} onHide={() => { onHide && onHide(cropKey) }} editVisible={editVisible} />
            }}
        </CropImgConsumer>
    )
}
