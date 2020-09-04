import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh } from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

import './index.less'

import waitpayPng from '../../../images/shop.jpg';
import rightArrow from '../../../images/right_arrow@2x.png';

export default () => {

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const Threshold = 20;

    const onScrollToLower = () => {
        console.log(1);
    }

    const onScroll = () => {

    }

    const goCouponList = () => {

    }

    const onRefresherRefresh = (e) => {
        setLoading(true);
        setTimeout(() => {
            setList([
                1,2,3,4
            ])
            setLoading(false);
        }, 1000)
    }

    return (
        <ScrollView
            className='scrollview'
            scrollY
            scrollWithAnimation
            scrollAnchoring
            refresherEnabled
            refresherThreshold="30"
            refresherTriggered={loading}
            style={{
                height: '100vh'
            }}
            className="index"
            lowerThreshold={Threshold}
            upperThreshold={Threshold}
            onScrollToLower={onScrollToLower} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
            onScroll={onScroll}
            onRefresherRefresh={onRefresherRefresh}
        >
            <View className='tips'>
                <Text>温馨提示，每个订单只能使用一张优惠券哦～</Text>
            </View>
            <View className='list'>
                {
                    list.map((item, index) => {
                        return (
                            <View className='list-item' key={index}>
                                { 
                                    index == 0 && 
                                    <View className="top">
                                        <View className="triangle"></View>
                                        <Text className="new">新</Text>
                                    </View> 
                                }
                                <View className='list-item-header'>
                                    <View className="list-item-header-left">
                                        <Image src={waitpayPng}/>
                                        <View className="list-item-header-text">
                                            <View className="name">6寸照片打印券10张</View>
                                            <View>
                                                <View className="sill">无门槛使用</View>
                                                <View className="time">有效期至 2020.8.24</View>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="list-item-header-btn">使用</View>
                                </View>
                                <View className="list-item-desc">
                                    <Text>适用6寸lomo卡，优惠券将在您结算时自动抵扣</Text>
                                </View>
                            </View>
                        )
                    })
                }
            </View>
            <View className="fotter" onClick={goCouponList}>
                <Text>更多历史优惠券</Text>
                <Image src={rightArrow}/>
            </View>
        </ScrollView>
    )
}

