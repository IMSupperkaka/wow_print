// Transition 用以解决react-transition-group在Taro中进出场动画失效的单个动画组件
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

// TODO: unmount transition-group
export default (props) => {

  const { timeout = 0 } = props;

  const [state, setState] = useState(null);

  useEffect(() => {

    let enterTimer = null;
    let exitTimer = null;

    if (props.in) {
      setState('enter');
      setTimeout(() => {
        setState('enter-active');
      }, 0);
      enterTimer = setTimeout(() => {
        setState('enter-done');
      }, timeout)
    } else {
      if (state == null) {
        return;
      }
      setState('exit');
      setTimeout(() => {
        setState('exit-active');
      }, 0);
      exitTimer = setTimeout(() => {
        setState('exit-done');
      }, timeout)
    }
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    }
  }, [props.in])

  if (!props.in && (state == null || state == 'exit-done')) {
    return null;
  }

  const CloneChildren = React.cloneElement(props.children, {
    className: classNames(props.children.props.className, props.classNames + '-' + state)
  })

  return CloneChildren;
}
