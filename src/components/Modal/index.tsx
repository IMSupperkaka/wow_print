import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import { Transition } from 'react-transition-group';
// import Transition from '../Transition'

import './index.less'

const Modal = (props) => {

    const { onClose, visible, className } = props;

    const duration = 300;

    const fadeDefaultStyle = {
        transition: `background ${duration}ms ease-in-out`,
        backgroundColor: 'transparent'
    }

    const fadeTransitionStyles = {
        entering: { backgroundColor: 'rgba(0,0,0,.5)' },
        entered: { backgroundColor: 'rgba(0,0,0,.5)' },
        exiting: { backgroundColor: 'transparent' },
        exited: { backgroundColor: 'transparent' },
    };

    const defaultStyle = {
        transition: `transform ${duration}ms ease-in-out`,
        transform: 'translateY(100%)'
    }

    const transitionStyles = {
        entering: { transform: 'translateY(0%)' },
        entered: { transform: 'translateY(0%)' },
        exiting: { transform: 'translateY(100%)' },
        exited: { transform: 'translateY(100%)' }
    };

    return (
        <View className="wy-modal">
            <Transition in={visible} timeout={duration} unmountOnExit classNames="fade-in">
                {
                    (state) => {
                        return (
                            <View style={{
                                ...fadeDefaultStyle,
                                ...fadeTransitionStyles[state]
                            }}
                            className="wy-modal__overlay" onClick={onClose}></View>
                        )
                    }
                }
            </Transition>
            <Transition in={visible} timeout={duration} classNames="bottom-top">
                {
                    (state) => {
                        return (
                            <View style={{
                                ...defaultStyle,
                                ...transitionStyles[state]
                                }} className={classNames("wy-modal__container", className)}>
                                { props.children }
                            </View>
                        )
                    }
                }
            </Transition>
        </View>
    )
}

Modal.addGlobalClass = true;

export default Modal;
