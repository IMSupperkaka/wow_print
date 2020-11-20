import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
// import { Transition } from 'react-transition-group';

import Transition from '../Transition'
import './index.less'

const Modal = (props) => {

    const { visible, onClose, onSuccess } = props;

    const onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    const duration = 300;

    return (
        <View className="wy-toast">
            <Transition in={visible} timeout={duration} classNames="fade-in">
                <View onTouchMove={onTouchMove} className="wy-toast__overlay" onClick={onClose}></View>
            </Transition>
            <View className="wy-toast__container-wrap">
                <Transition in={visible} timeout={duration} classNames="scale-in">
                    <View className={classNames("wy-toast__container", props.className)}>
                        <View className="wy-toast__content">
                            {
                                props.title && <View className="wy-toast__title">{props.title}</View>
                            }
                            {
                                typeof(props.children) == 'string' ? <View className="wy-toast__body">
                                    {props.children}
                                </View> :
                                props.children
                            }
                            <View className="wy-toast__footer">
                                <View className="wy-toast__cancel" onClick={onClose}>
                                    {props.cancelText || '取消'}
                                </View>
                                <View className="wy-toast__confirm" onClick={onSuccess}>
                                    {props.confirmText || '确定'}
                                </View>
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
