import React, { Component, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { AtFloatLayout } from "taro-ui"
import { View, Image, ScrollView, Swiper, Button, SwiperItem } from '@tarojs/components'

import './index.less'
import Modal from '../../components/Modal'
import iconCoupon from '../../../images/icon_coupon@2x.png'
import { detail as getDetail } from '../../services/product'

export default () => {
    
    const [query, setQuery] = useState({});
    const [detail, setDetail] = useState({});
    const [current, setCurrent] = useState(0);
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        getDetail({
            goodId: query.id
        }).then(({ data })=> {
            setDetail(data.data);
        })
    }, [])

    const handleOpenCoupon = () => {
        setIsOpened(true);
    }

    const handleCloseCoupon = () => {
        setIsOpened(false);
    }

    return (
        <View className="index">
            <View className="banner-wrap">
                <Swiper className="banner" current={current} onChange={(e) => {
                    setCurrent(e.detail.current);
                }}>
                    {
                        detail?.productMainImages?.map((v, index) => {
                            return (
                                <SwiperItem key={index}>
                                    <Image src={v} mode="aspectFill"/>
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                <View className="indicator">
                    {current + 1}/{detail?.productMainImages?.length}
                </View>
            </View>
            <View className="product-info">
                <View className="product-price">￥{ (detail.sellingPrice / 100).toFixed(2) }</View>
                <View className="product-name">{ detail.name }</View>
            </View>
            <View className="coupon-cell" onClick={handleOpenCoupon}>
                <View>
                    <Image src={iconCoupon}/>
                    优惠券
                </View>
            </View>
            <View className="product-detail">
                <View className="detail-title">商品详情</View>
                {
                    detail?.productDetailImages?.map((url) => {
                        return <Image mode="widthFix" class="detail-image" src={url}/>
                    })
                }
            </View>
            <View className="submit-btn">
                立即打印
            </View>
            <Modal className="coupon-modal" visible={isOpened} onClose={handleCloseCoupon}>
                <View className="title">优惠券</View>
                <ScrollView className="content" scrollY={true}>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                    <View>优惠券</View>
                </ScrollView>
                <View className="footer">不使用优惠券</View>
            </Modal>
        </View>
    )
};