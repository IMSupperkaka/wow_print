import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

import './index.less'
import { list } from '../../services/coupon';
import Empty from '../../components/Empty';
import rightArrow from '../../../images/right_arrow@2x.png';

export default () => {

    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        onLoad(false);
    }, [])

    usePullDownRefresh(() => {
        onLoad(true);
    })

    useReachBottom(() => {
        onLoad(false);
    })

    const onLoad = (refresh = false) => {
        if (!refresh && isFinish) {
            return false;
        }
        return list({
            type: 1,
            page: refresh ? 1 : page.current,
            pageSize: page.pageSize
        }).then(({ data }) => {
            setIsFinish(data.data.current >= data.data.pages);
            if (refresh) {
                setRecords(data.data.records);
            } else {
                setRecords(records.concat(data.data.records));
            }
            setPage({
                current: data.data.current,
                pageSize: data.data.size,
                total: data.data.total
            })
            Taro.stopPullDownRefresh();
        }).catch(() => {
            Taro.stopPullDownRefresh();
        })
    }

    const goCouponList = () => {
        Taro.navigateTo({
            url: '/pages/couponList/index'
        })
    }

    return (
        <View className="index">
            {
                records.length > 0 ?
                <>
                    <View className='tips'>
                        <Text>温馨提示，每个订单只能使用一张优惠券哦～</Text>
                    </View>
                    <View className='list'>
                        {
                            records.map((item, index) => {
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
                                                <Image src={item.couponGoodImage}/>
                                                <View className="list-item-header-text">
                                                    <View className="name">{item.couponName}</View>
                                                    <View>
                                                        <View className="sill">无门槛使用</View>
                                                        <View className="time">有效期至 {item.endTime}</View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View className="list-item-header-btn">使用</View>
                                        </View>
                                        <View className="list-item-desc">
                                            <Text>{ item.couponDescription }</Text>
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
                </> :
                <Empty text="有些难为情，券不在"/>
            }
        </View>
    )
}

