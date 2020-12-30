import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
// import { Transition } from 'react-transition-group';

import Transition from '../Transition'
import './index.less'

const Modal = (props) => {

    const { visible, onClose } = props;

    const duration = 300;

    return (
        <View className="wy-dialog">
            <Transition in={visible} timeout={duration} classNames="fade-in">
                <View catchMove className="wy-dialog__overlay" onClick={onClose}></View>
            </Transition>
            <View className="wy-dialog__container-wrap">
                <Transition in={visible} timeout={duration} classNames="scale-in">
                    <View className={classNames("wy-dialog__container", props.className)}>
                        <View className="wy-dialog__content">
                            {
                                props.title && <View className="wy-dialog__title">{props.title}</View>
                            }
                            <View className="wy-dialog__body">
                                {props.children}
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
