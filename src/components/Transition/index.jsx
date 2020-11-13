// Transition 用以解决react-transition-group在Taro中进出场动画失效的单个动画组件
import React, { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';

import useFreshState from '../../hooks/useFreshState';

// TODO: unmount transition-group
export default React.memo((props) => {

    // console.log('render')

    const { timeout = 0 } = props;

    const [getState, setState] = useFreshState(null);

    useEffect(() => {

        console.log(props.in)

        let enterTimer = null;
        let exitTimer = null;

        clearTimeout(enterTimer);
        clearTimeout(exitTimer);

        if (props.in) {
            setState('enter');
            Taro.nextTick(() => {
                setState('enter-active');
            })
            enterTimer = setTimeout(() => {
                setState('enter-done');
            }, timeout)
        } else {
            if (getState() == null) {
                return;
            }
            setState('exit');
            Taro.nextTick(() => {
                setState('exit-active');
            })
            exitTimer = setTimeout(() => {
                setState('exit-done');
            }, timeout)
        }
        return () => {
            // console.log('destory')
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
        }
    }, [props.in])

    // console.log(props.in)

    if (!props.in && (getState() == null || getState() == 'exit-done')) {
        return null;
    }

    const CloneChildren = React.cloneElement(props.children, {
        className: classNames(props.children.props.className, props.classNames + '-' + getState())
    })

    return CloneChildren;
}, (prevProps, nextProps) => {
    return prevProps.in === nextProps.in;
})
