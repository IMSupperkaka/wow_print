import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'

import Transition from '../Transition'
import Portal from '../Portal'
import './index.less'

const Modal = (props) => {

    const { onClose, visible, className } = props;

    const duration = 300;

    const getContainer = () => {
        if (process.env.TARO_ENV === 'h5') {
            return document.querySelector('body');
        }
        return null;
    }

    return (
        <Portal getContainer={getContainer}>
            <View className="wy-modal">
                <Transition in={visible} timeout={duration} classNames="fade-in">
                    <View catchMove className="wy-modal__overlay" onClick={onClose}></View>
                </Transition>
                <Transition in={visible} timeout={duration} classNames="bottom-top">
                    <View className={classNames("wy-modal__container", className)}>
                        {props.children}
                    </View>
                </Transition>
            </View>
        </Portal>
    )
}

Modal.addGlobalClass = true;

export default Modal;
