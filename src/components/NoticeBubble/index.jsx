import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { View, Swiper, SwiperItem } from '@tarojs/components';

import './index.less';

const config = {
    duration: 3000
}

export default (props) => {

    const list = props.list.concat(props.list) || [];

    const [curIndex, setCurIndex] = useState(0);

    const timer = useRef(null);

    useEffect(() => {
        timer.current = setInterval(() => {
            setCurIndex((curIndex) => {
                return curIndex >= list.length - 1 ? 0 : ++ curIndex
            })
        }, config.duration)
        return () => {
            clearInterval(timer.current);
        }
    }, [])

    return (
        <View className={classNames("wy-noticebar-wrap", props.className)}>
            <View className="wy-noticebar-content">
                {
                    list.map((v, index) => {
                        return (
                            index == curIndex && 
                            <View className={classNames("bubble-item")} key={index}>{ props.renderItem(v) }</View>
                        )
                    })
                }
            </View>
        </View>
    )
}
