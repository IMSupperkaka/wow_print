import React, { useState, useEffect } from 'react';
import Taro, { usePageScroll } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.less';

export default (props) => {

    const [statusBarHeight, setStatusBarHeight] = useState(0);

    const [scrollTop, setScrollTop] = useState(0);

    usePageScroll(res => {
        setScrollTop(res.scrollTop);
    })

    useEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            document.querySelector('.taro-tabbar__panel').addEventListener('scroll', (e) => {
                setScrollTop(e.target.scrollTop);
            })
        }
        Taro.getSystemInfo({
            success: (result) => {
                setStatusBarHeight(result.statusBarHeight)
            }
        })
    })

    const percent = scrollTop / 150;

    let navBarStyle = {
        backgroundColor: `rgba(255,255,255,${percent * 1})`,
        color: `rgba(${255 * (1 - percent)},${255 * (1 - percent)},${255 * (1 - percent)},1)`
    }

    if (process.env.TARO_ENV === 'h5') {
        navBarStyle = {
            opacity: (1 - percent)
        }
    }

    return (
        <View className="wy-nav-bar" style={{ paddingTop: statusBarHeight + 'px', ...navBarStyle }}>
            <View className="wy-nav-bar-content">
                {
                    props.left
                }
            </View>
        </View>
    )
};
