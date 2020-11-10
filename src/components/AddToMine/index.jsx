import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import day from 'dayjs';
import { AtIcon } from 'taro-ui';
import { View } from '@tarojs/components';

import './index.less';
import { Transition } from 'react-transition-group';
// import Transition from '../Transition';

export default () => {

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const lastCloseTime = Taro.getStorageSync('lastCloseTime');
        if (!lastCloseTime || day(lastCloseTime).isBefore(day().startOf('day'))) {
            setVisible(true);
        }
    }, []);  

    const { statusBarHeight } = Taro.getSystemInfoSync()

    const handleClose = () => {
        Taro.setStorageSync('lastCloseTime', day().format());
        setVisible(false);
    }

    const duration = 300;

    const defaultStyle = {
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0
    }

    const transitionStyles = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
    };

    return (
        <Transition in={visible} unmountOnExit timeout={duration}>
            {(state) => {
                return (
                    <View style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}
                    className="addto-mine-wrap" style={{ top: statusBarHeight + 45 }}>
                        <AtIcon onClick={handleClose} className="addto-mine-close-icon" value='close' size='12' color='#FFF'/>
                        点击···添加“我的小程序”享服务更便捷
                    </View>
                )
            }}
        </Transition>
    )
}
