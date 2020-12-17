import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Swiper, ScrollView, SwiperItem } from '@tarojs/components'

import Tab from './Tab';
import TabPanel from './TabPanel';
import './index.less'

export default (props) => {

    const { current, onChange } = props;
    const [enableScroll, setEnableScroll] = useState(true);
    const [screenWidth, setScreenWidth] = useState(0);
    const [dx, setDx] = useState(0);
    const [left, setLeft] = useState(0);

    const { animation = false } = props;

    useEffect(() => {
        const info = Taro.getSystemInfoSync();
        setScreenWidth(info.screenWidth);
    }, [])

    const onTransition = (e) => {
        setLeft(left + e.detail.dx - dx);
        setEnableScroll(false);
        setDx(e.detail.dx);
    }

    const onAnimationFinish = () => {
        setEnableScroll(true);
        setDx(0);
    }

    const handleOnChange = (e) => {
        onChange(e.detail.current);
    }

    const length = props.children.length;
    const translateX = animation ? (screenWidth / 2 + left) / length : ((screenWidth / 2 + current * screenWidth) / length);
    const transitionDuration = animation ? '0' : '0.3s';

    const TabList = React.Children.map(props.children, (child, index) => {
        if (child.type) {
            return (
                <Tab active={index == current} onClick={() => { onChange(index) }} {...child.props} />
            )
        } else {
            return child;
        }
    })

    const TabPanelList = React.Children.map(props.children, (child, index) => {
        if (child.type) {
            return (
                <SwiperItem>
                    <TabPanel activeKey={current} active={index == current} node={React.cloneElement(child)}/>
                </SwiperItem>
            )
        }
    })

    return (
        <View>
            <View className="wy-tabs__wrap">
                {TabList}
                <View className="wy-tabs__line" style={{ transitionDuration: transitionDuration, transform: `translateX(${translateX}px) translateX(-50%)` }}></View>
            </View>
            <Swiper current={current} className="wy-tabs__content" onChange={handleOnChange} onAnimationFinish={onAnimationFinish} onTransition={onTransition}>
                {TabPanelList}
            </Swiper>
        </View>
    )
}
