import React, { Component, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text, Swiper, Button, SwiperItem } from '@tarojs/components'

import './index.less'
import iconCoupon from '../../../images/icon_coupon@2x.png'
import { detail as getDetail } from '../../services/product'

export default () => {
    
    const [query, setQuery] = useState({});
    const [detail, setDetail] = useState({});
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        getDetail({
            goodId: query.id
        }).then(({ data })=> {
            setDetail(data.data);
        })
    }, [])

    return (
        <View>
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
            <View className="coupon-cell">
                <View>
                    <Image src={iconCoupon}/>
                    优惠券
                </View>
            </View>
        </View>
    )
};