import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh } from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

export default (props) => {

    const [loading, setLoading] = useState(false);
    const Threshold = 20;

    const onScrollToLower = () => {
        setLoading(true);
        try {
            await props.onLoad();
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    const onRefresherRefresh = async (e) => {
        setLoading(true);
        try {
            await props.onLoad();
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
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
            className="index"
            lowerThreshold={Threshold}
            upperThreshold={Threshold}
            onScrollToLower={onScrollToLower}
            onScroll={onScroll}
            onRefresherRefresh={onRefresherRefresh}
            {...props}
        >
            {props.children}
        </ScrollView>
    )
}

