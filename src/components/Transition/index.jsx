// Transition 用以解决react-transition-group在Taro中进出场动画失效的单个动画组件
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import usePrevious from '../../hooks/usePrevious';

// TODO: unmount transition-group
export default (props) => {

    const [state, setState] = useState(null);
    const [isAnimate, setIsAnimate] = useState(false);

    const previousIn = usePrevious(props.in);

    const transitionend = () => {
        setIsAnimate(false);
    }

    useEffect(() => {
        if (!isAnimate) {
            setState((state) => {
                if (state == 'enter-active') {
                    return 'enter-done';
                }
                if (state == 'exit-active') {
                    return 'exit-done';
                }
                return state;
            })
        }
    }, [state, isAnimate])

    useEffect(() => {
        if (previousIn !== props.in) {
            if (props.in) {
                setState('enter');
                setIsAnimate(true);
                setTimeout(() => {
                    setState('enter-active');
                }, 0);
            } else {
                if (state == null) {
                    return;
                }
                setState('exit');
                setIsAnimate(true);
                setTimeout(() => {
                    setState('exit-active');
                }, 0);
            }
        }
    }, [props.in, previousIn])

    if (!props.in && !isAnimate) {
        return null;
    }

    const CloneChildren = React.cloneElement(props.children, {
        className: classNames(props.children.props.className, props.classNames + '-' + state),
        onTransitionend: transitionend
    })

    return CloneChildren;
}
