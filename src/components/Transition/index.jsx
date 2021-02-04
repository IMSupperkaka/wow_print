// Transition 用以解决react-transition-group在Taro中进出场动画失效的单个动画组件
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';

// TODO: unmount transition-group
export default (props) => {

    const { timeout = 0 } = props;

    let initialStatus;

    if (props.in) {
        initialStatus = 'enter-active';
    } else {
        initialStatus = 'unmounted';
    }

    const [state, setState] = useState(initialStatus);

    const childRef = useRef(null);

    const nextCallbackRef = useRef(null);

    const setNextCallBack = (callback) => {
        let active = true;
        nextCallbackRef.current = () => {
            if (active) {
                active = false;
                nextCallbackRef.current = null;
                callback();
            }
        };
        nextCallbackRef.current.cancel = () => {
            active = false;
        }
        return nextCallbackRef.current;
    }

    const cancelNextCallback = () => {
        if (nextCallbackRef.current) {
            nextCallbackRef.current.cancel();
            nextCallbackRef.current = null;
        }
    }

    const onEnter = () => {
        setState('enter');
    }

    const onEntering = () => {
        setState('enter-active');
    }

    const onEntered = () => {
        setState('enter-done');
    }

    const onExit = () => {
        setState('exit');
    }

    const onExiting = () => {
        setState('exit-active');
    }

    const onExited = () => {
        setState('exit-done');
    }

    const onTransitionEnd = (timeout, handler) => {
        setTimeout(setNextCallBack(handler), timeout);
    }

    useLayoutEffect(() => {
        if (state == 'enter') {
            Taro.nextTick(() => {
                onEntering();
            })
        }
        if (state == 'enter-active') {
            onTransitionEnd(timeout, () => {
                onEntered();
            });
        }
        if (state == 'exit') {
            Taro.nextTick(() => {
                onExiting();
            })
        }
        if (state == 'exit-active') {
            onTransitionEnd(timeout, () => {
                onExited();
            });
        }
    }, [state])

    useLayoutEffect(() => {
        cancelNextCallback();
        if (props.in) {
            onEnter();
        } else {
            if (state != 'unmounted') {
                onExit();
            }
        }
        return () => {
            cancelNextCallback();
        }
    }, [props.in])

    if (state == 'unmounted' || state == 'exit-done') {
        return null;
    }

    const CloneChildren = React.cloneElement(props.children, {
        ref: childRef,
        className: classNames(props.children.props.className, props.classNames + '-' + state)
    })

    return CloneChildren;
}
