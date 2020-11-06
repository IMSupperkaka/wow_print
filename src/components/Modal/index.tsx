import React from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Animate from 'rc-animate'
import classNames from 'classnames'
import Transition from '../Transition'

import './index.less'

const Modal = (props) => {

    const { onClose, visible, className } = props;

    return (
        <View className="wy-modal">
            <Transition in={visible} timeout={0} classNames="fade-in">
                <View className="wy-modal__overlay" onClick={onClose}></View>
            </Transition>
            <Transition in={visible} timeout={0} classNames="bottom-top">
                <View className={classNames("wy-modal__container", className)}>
                    { props.children }
                </View>
            </Transition>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
