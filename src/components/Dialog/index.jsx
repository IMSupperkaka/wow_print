import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
// import { Transition } from 'react-transition-group';

import Transition from '../Transition'
import './index.less'

const Modal = (props) => {

    const { visible, onClose } = props;

    const onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    const duration = 300;

    const defaultStyle = {
        transition: `background ${duration}ms ease-in-out`,
        backgroundColor: 'transparent'
    }

    const transitionStyles = {
        entering: { backgroundColor: 'rgba(0,0,0,.5)' },
        entered: { backgroundColor: 'rgba(0,0,0,.5)' },
        exiting: { backgroundColor: 'transparent' },
        exited: { backgroundColor: 'transparent' },
    };

    const scaleDefaultStyle = {
        transition: `transform ${duration}ms ease-in-out`,
        transform: 'scale(0)'
    }

    const scaleTransitionStyles = {
        entering: { transform: 'scale(1)' },
        entered: { transform: 'scale(1)' },
        exiting: { transform: 'scale(0)' },
        exited: { transform: 'scale(0)' },
    };

    return (
        <View className="wy-dialog">
            <Transition in={visible} timeout={duration} classNames="fade-in">
              <View onTouchMove={onTouchMove} className="wy-dialog__overlay" onClick={onClose}></View>
            </Transition>
            <View className="wy-dialog__container-wrap">
                <Transition in={visible} timeout={duration} classNames="scale-in">
                  <View className={classNames("wy-dialog__container", props.className)}>
                      <View className="wy-dialog__content">
                          {
                              props.title && <View className="wy-dialog__title">{ props.title }</View>
                          }
                          <View className="wy-dialog__body">
                              { props.children }
                          </View>
                      </View>
                  </View>
                </Transition>
            </View>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
