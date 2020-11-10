import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import Transition from '../Transition'

import './index.less'

const Modal = (props) => {

    const { onClose, visible, className } = props;

    const duration = 300;

    return (
        <View className="wy-modal">
            <Transition in={visible}  timeout={duration} classNames="fade-in">
              <View className="wy-modal__overlay" onClick={onClose}></View>
            </Transition>
            <Transition in={visible} timeout={duration} classNames="bottom-top">
              <View className={classNames("wy-modal__container", className)}>
                  { props.children }
              </View>
            </Transition>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
