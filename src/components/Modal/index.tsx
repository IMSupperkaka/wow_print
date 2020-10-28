import React from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Animate from 'rc-animate'
import classNames from 'classnames'

import './index.less'

const Modal = (props) => {

    const { onClose, visible, className, title } = props;

    return (
        <View className={classNames('wy-modal', visible ? 'active' : '')}>
            <View className="wy-modal__overlay" onClick={onClose}></View>
            <View className={classNames("wy-modal__container", className)}>
                {
                    title && <View className="wy-modal__title">{ title }</View>
                }
                { props.children }
            </View>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
