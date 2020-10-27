import React from 'react';
import { View, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.less';
import { list } from '../../services/portfolio';
import List from '../../components/List';

const getData = ({ current, pageSize }) => {
    return list({
        pageNum: current,
        pageSize
    }).then(({ data }) => {
        return {
            list: data.data.records,
            total: data.data.total
        }
    })
}

export default () => {

    const handleGoDetail = (item) => {
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${item.goodId}&portfolioId=${item.id}`
        })
    }

    const handlePay = (item, e) => {
        e.stopPropagation();
        if (item.finishPage < item.totalPage) {
            Taro.showModal({
                title: '确认购买',
                content: '还有未完成的页码哦',
                confirmText: '确认',
                cancelText: '取消',
                confirmColor: '#FF6345',
                success: (res) => {
                    if (res.confirm) {
                        // Taro.navigateTo({
                        //     url: `/pages/result/index?type=cancel&id=${order.id}`
                        // })
                    }
                }
            })
        }
    }

    return (
        <View>
            <List onLoad={getData} className="portfolio-list">
                {
                    ({ list }) => {
                        return list.map((item) => {
                            return (
                                <View className="portfolio-item" onClick={() => { handleGoDetail(item) }}>
                                    <View className="portfolio-left">
                                        <Image class="portfolio-img" src={item.indexImage}/>
                                        <View className="portfolio-info">
                                            <View className="portfolio-title">
                                                { item.name }
                                                {
                                                    item.coupon &&
                                                    <View className="coupon-sign">优惠券</View>
                                                }
                                            </View>
                                            <View className="portfolio-page">完成页码: { item.finishPage } / { item.totalPage }</View>
                                            <View className="portfolio-time">创作时间: { item.updateTime.split(' ')[0] }</View>
                                        </View>
                                    </View>
                                    <Button onClick={(e) => { handlePay(item, e) }} className="radius-btn primary-outline-btn">购买</Button>
                                </View>
                            )
                        })
                    }
                }
            </List>
        </View>
    )
}
