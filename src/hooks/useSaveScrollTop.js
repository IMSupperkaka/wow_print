import React, { useState } from 'react';
import Taro, { useDidShow, usePageScroll } from '@tarojs/taro';

export default () => {

    const [scrollTop, setScrollTop] = useState(0);

    usePageScroll((res) => {
        setScrollTop(res.scrollTop)
    })

    useDidShow(() => {
        if (process.env.TARO_ENV === 'h5') {
            setTimeout(() => {
                document.querySelector('.taro-tabbar__panel').scrollTop = scrollTop;
            }, 0)
            // Taro.pageScrollTo({
            //     scrollTop: scrollTop,
            //     duration: 0
            // })
        }
    })

}
