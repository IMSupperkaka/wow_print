import React, { useRef } from 'react';
import Taro, { useDidShow, usePageScroll } from '@tarojs/taro';

export default () => {

    const scrollTopRef = useRef();

    scrollTopRef.current = 0;

    usePageScroll((res) => {
        scrollTopRef.current = res.scrollTop;
    })

    useDidShow(() => {
        if (process.env.TARO_ENV === 'h5') {
            setTimeout(() => {
                document.querySelector('.taro-tabbar__panel').scrollTop = scrollTopRef.current;
            }, 0)
        }
    })

}
