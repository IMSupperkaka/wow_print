import React from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Animate from 'rc-animate'
import classNames from 'classnames'

import './index.less'

const Modal = (props) => {

    const { onClose } = props;

    return (
        <View className={classNames('wy-modal', props.visible ? 'active' : '')}>
            <View className="wy-modal__overlay" onClick={onClose}></View>
            <View className={classNames("wy-modal__container", props.className)}>
                {
                    props.title && <View className="wy-modal__title">{ props.title }</View>
                }
                { props.children }
            </View>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
