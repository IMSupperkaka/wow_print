import React, { useRef, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import day from 'dayjs'
import classnames from 'classnames'
import { View, Image, Text, Input, Button } from '@tarojs/components'

import styles from './index.module.less'
import { list, pre, exchange } from '@/services/coupon';
import Empty from '@/components/Empty';
import useList from '../../hooks/useList';
import rightArrow from '@/images/right_arrow@2x.png';
import couponEmptyIcon from '@/images/bg_no_coupons@2x.png';

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

    const [cdkey, setCdkey] = useState(null);

    const { records, refresh } = useList({
        pullDownRefresh: true,
        pageSize: 5,
        onLoad: ({ current, pageSize }) => {
            return list({
                type: 1,
                pageNum: current,
                pageSize: pageSize
            }).then(({ data }) => {
                const currentTime = day();
                return {
                    list: data.data.records.map((v) => {
                        return {
                            ...v,
                            new: currentTime.diff(day(v.createTime)) <= 86400000
                        }
                    }),
                    total: data.data.total,
                    current: data.data.current
                }
            })
        }
    })

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
        }).catch(({ code }) => {
            if (code == 10045) {
                setTimeout(() => {
                    refresh();
                }, 1500)
            }
        })
    }

    const handleExchange = () => {
        if (!/^\w{6}$/.test(cdkey)) {
            return Taro.showToast({
                title: '请填写正确的兑换码',
                icon: 'none',
                duration: 1500
            })
        }
        exchange({
            cdKey: cdkey
        }).then(() => {
            setCdkey(null);
            refresh();
            Taro.showToast({
                title: '兑换成功',
                icon: 'none',
                duration: 1500
            })
        }).catch(() => {
            setCdkey(null);
        })
    }

    return (
        <View className={styles['index']}>
            <View className={styles['cdkey-wrap']}>
                <Input value={cdkey} onInput={(e) => { setCdkey(e.detail.value) }} maxlength={6} placeholderStyle={{ color: '#c1c1c1' }} className={styles['exchange-input']} type='text' placeholder='请输入兑换码（长按粘贴）'/>
                <Button onClick={handleExchange} className={classnames('primary-btn', styles['exchange-btn'])}>兑换</Button>
            </View>
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
                                                (item.new || item.giveType == 2) &&
                                                <View className={styles['top']}>
                                                    <View className={classnames(styles['triangle'], item.giveType == 2 && styles['exchange'])}></View>
                                                    <Text className={styles['new']}>
                                                        {
                                                            item.giveType == 1 ?
                                                            '新' :
                                                            '兑'
                                                        }
                                                    </Text>
                                                </View>
                                            }
                                            <View className={styles['list-item-header']}>
                                                <View className={styles['list-item-header-left']}>
                                                    <Image className={styles['coupon-img']} src={item.couponGoodImage} />
                                                    <View className={styles['list-item-header-text']}>
                                                        <View className={styles['name']}>{item.couponName}</View>
                                                        <View>
                                                            <View className={styles['sill']}>{item.freeContent}</View>
                                                            <View className={styles['time']}>有效期至 {item.endTime}</View>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View className={styles['list-item-header-btn']} onClick={handleUse.bind(this, item)}>使用</View>
                                                <ExpiresText className={styles['expires-time']} endTime={item.endTime} />
                                            </View>
                                            <View className={styles['list-item-desc']}>
                                                <Text>{item.couponDescription}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View className={styles['fotter']} onClick={goCouponList}>
                            <Text>更多历史优惠券</Text>
                            <Image className={styles['fotter-image']} src={rightArrow} />
                        </View>
                    </> :
                    <Empty src={couponEmptyIcon} text="有些难为情，券不在" />
            }
        </View>
    )
}

