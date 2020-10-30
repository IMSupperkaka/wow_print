// Transition 用以解决react-transition-group在Taro中进出场动画失效的单个动画组件
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

export default (props) => {

    const [state, setState] = useState(null);

    const ref = useRef();

    const transitionend = () => {
      setState((state) => {
        return state == 'enter-active' ? 'enter-done' : 'exit-done';
      })
    }

    useEffect(() => {
        if (ref.current) {
          ref.current.addEventListener('transitionend', transitionend, false)
        }
        if (props.in) {
            setState('enter');
            setTimeout(() => {
              setState('enter-active');
            }, 0);
        } else {
            if (state == null) {
                return;
            }
            setState('exit');
            setTimeout(() => {
              setState('exit-active');
            }, 0);
        }
        return () => {
          ref.current && ref.current.removeEventListener('transitionend', transitionend);
        }
    }, [props.in])

    if (!props.in && (!state || state == 'exit-done')) {
        return null;
    }

    const CloneChildren = React.cloneElement(props.children, {
        className: classNames(props.children.props.className, props.classNames + '-' + state),
        ref: ref
    })

    return CloneChildren;
}
