import React, { useState, useRef, useLayoutEffect } from 'react';
import Taro, { useDidShow, useDidHide, useReady } from '@tarojs/taro';

export default () => {

    const [scrollTop, setScrollTop] = useState(0);

    const scrollRef = useRef();

    const scrollTopRef = useRef();

    const cancelRef = useRef();

    scrollTopRef.current = scrollTop;

    const scrollCallback = (e) => {
        if (!cancelRef.current) {
            setScrollTop(e.target.scrollTop);
            scrollTopRef.current = e.target.scrollTop;
        }
    }

    useDidHide(() => {
        if (process.env.TARO_ENV === 'h5') {
            cancelRef.current = true;
            scrollRef.current.removeEventListener('scroll', scrollCallback);
        }
    })

    useDidShow(() => {
        if (process.env.TARO_ENV === 'h5') {
            cancelRef.current = false;
            setTimeout(() => {
                scrollRef.current.scrollTop = scrollTop;
            }, 0)
        }
    })

    useLayoutEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            scrollRef.current = document.querySelector('.taro-tabbar__panel');
            scrollRef.current.addEventListener('scroll', scrollCallback);
            return () => {
                scrollRef.current.removeEventListener('scroll', scrollCallback);
            }
        }
    }, [])

}
