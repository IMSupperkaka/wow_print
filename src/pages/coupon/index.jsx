import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import day from 'dayjs'
import { usePullDownRefresh, useReachBottom, useDidShow } from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

import styles from './index.module.less'
import { list, pre } from '../../services/coupon';
import Empty from '../../components/Empty';
import rightArrow from '../../../images/right_arrow@2x.png';
import couponEmptyIcon from '../../../images/bg_no_coupons@2x.png';


const ExpiresText = ({ endTime, ...resetProps }) => {
    const expreisTime = day(endTime).diff(day()) / 60 / 60 / 1000;
    let text;
    if (expreisTime > 72) {
        return null;
    }
    if (expreisTime <= 24) {
        text = '今日过期';
    } else if (expreisTime <= 48) {
        text = '2天后过期';
    } else if (expreisTime <= 72) {
        text = '即将过期';
    }
    return <Text {...resetProps}>{text}</Text>
}

export default () => {

    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    useDidShow(() => {
        onLoad(true);
    })

    usePullDownRefresh(() => {
        onLoad(true);
    })

    useReachBottom(() => {
        onLoad(false);
    })

    useEffect(() => {
      if (process.env.TARO_ENV === 'h5') {
          document.querySelector('.taro-tabbar__panel').onscroll = (e) => {
              if (e.target.clientHeight + e.target.scrollTop >= e.target.scrollHeight) {
                onLoad(false);
              }
          }
      }
    }, [])

    const onLoad = (refresh = false) => {
        if (!refresh && isFinish) {
            return false;
        }
        return list({
            type: 1,
            pageNum: refresh ? 1 : page.current + 1,
            pageSize: page.pageSize
        }).then(({ data }) => {
            const currentTime = day();
            data.data.records = data.data.records.map((v) => {
                return {
                    ...v,
                    new: currentTime.diff(day(v.createTime)) <= 86400000
                }
            })
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

    const handleUse = (coupon) => {
        pre({
            id: coupon.id
        }).then(() => {
            Taro.navigateTo({
                url: `/pages/productDetail/index?id=${coupon.couponGoodId}`
            })
        })
    }

    return (
        <View className={styles['index']}>
            {
                records.length > 0 ?
                <>
                    <View className={styles['tips']}>
                        <Text>温馨提示，每个订单只能使用一张优惠券哦～</Text>
                    </View>
                    <View className={styles['list']}>
                        {
                            records.map((item, index) => {
                                return (
                                    <View className={styles['list-item']} key={index}>
                                        {
                                            item.new &&
                                            <View className={styles['top']}>
                                                <View className={styles['triangle']}></View>
                                                <Text className={styles['new']}>新</Text>
                                            </View>
                                        }
                                        <View className={styles['list-item-header']}>
                                            <View className={styles['list-item-header-left']}>
                                                <Image className={styles['coupon-img']} src={item.couponGoodImage}/>
                                                <View className={styles['list-item-header-text']}>
                                                    <View className={styles['name']}>{item.couponName}</View>
                                                    <View>
                                                        <View className={styles['sill']}>无门槛使用</View>
                                                        <View className={styles['time']}>有效期至 {item.endTime}</View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View className={styles['list-item-header-btn']} onClick={handleUse.bind(this, item)}>使用</View>
                                            <ExpiresText className={styles['expires-time']} endTime={item.endTime}/>
                                        </View>
                                        <View className={styles['list-item-desc']}>
                                            <Text>{ item.couponDescription }</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                    <View className={styles['fotter']} onClick={goCouponList}>
                        <Text>更多历史优惠券</Text>
                        <Image className={styles['fotter-image']} src={rightArrow}/>
                    </View>
                </> :
                <Empty src={couponEmptyIcon} text="有些难为情，券不在"/>
            }
        </View>
    )
}

