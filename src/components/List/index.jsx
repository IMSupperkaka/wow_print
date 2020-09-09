import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh } from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

export default (props) => {

    const [loading, setLoading] = useState(false);
    const Threshold = 30;

    const onScrollToLower = async () => {
        await props.onLoad();
    }

    const onRefresherRefresh = async (e) => {
        setLoading(true);
        try {
            await props.onRefresh();
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                await props.onLoad();
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    return (
        <ScrollView
            className='scrollview'
            scrollY
            scrollWithAnimation
            scrollAnchoring
            refresherEnabled
            refresherThreshold={Threshold}
            refresherTriggered={loading}
            className="index"
            lowerThreshold={Threshold}
            upperThreshold={Threshold}
            onScrollToLower={onScrollToLower}
            onRefresherRefresh={onRefresherRefresh}
            {...props}
        >
            {props.children}
        </ScrollView>
    )
}

