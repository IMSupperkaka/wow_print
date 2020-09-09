import React from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text, Swiper, ScrollView, SwiperItem } from '@tarojs/components'

export default (props) => {
    return (
        <Swiper>
            <SwiperItem>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>全部</View>
                <View>123</View>
                <View>123</View>
                <View>123</View>
                <View>123</View>
                <View>123</View>
                <View>123</View>
            </SwiperItem>
            <SwiperItem>
                <ScrollView style={{ height: '100vh' }}>
                    待付款
                </ScrollView>
            </SwiperItem>
            <SwiperItem>
                <ScrollView style={{ height: '100vh' }}>
                    待发货
                </ScrollView>
            </SwiperItem>
            <SwiperItem>
                <ScrollView style={{ height: '100vh' }}>
                    待收货
                </ScrollView>
            </SwiperItem>
            <SwiperItem>
                <ScrollView style={{ height: '100vh' }}>
                    已取消
                </ScrollView>
            </SwiperItem>
            <SwiperItem>
                <ScrollView style={{ height: '100vh' }}>
                    已退款
                </ScrollView>
            </SwiperItem>
        </Swiper>
    )
}
