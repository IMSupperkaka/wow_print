import React from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Animate from 'rc-animate'
import classNames from 'classnames'

import './index.less'

const Modal = (props) => {

    const { onClose } = props;

    return (
        <View className={classNames('wy-dialog', props.visible ? 'active' : '')}>
            <View className="wy-dialog__overlay" onClick={onClose}></View>
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
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
