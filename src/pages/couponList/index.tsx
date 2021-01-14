import React, { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';

import styles from './index.module.less';
import { list } from '../../services/coupon';
import Empty from '../../components/Empty';

import icon_used from '../../../images/icon_Used@2x.png';
import icon_expired from '../../../images/icon_expired@2x.png';
import icon_disabled from '../../../images/lALPD4Bhr9v28EJycg_114_114.png';

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
            type: 2,
            pageNum: refresh ? 1 : page.current + 1,
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

    return (
        <View className={styles['index']}>
            {
                records.length > 0 ?
                <View className={styles['list']}>
                    {
                        records.map((item, index) => {

                            let icon;
                            switch (item.status) {
                                case 0:
                                    icon = icon_expired;
                                    break;
                                case 2:
                                    icon = icon_used;
                                    break;
                                case 3:
                                    icon = icon_disabled;
                                    break;
                                case 9:
                                    icon = icon_used;
                                    break;
                            }

                            return (
                                <View className='list-item' key={index}>
                                    <View className='list-item-header'>
                                        <View className="list-item-header-left">
                                            <Image className="coupon-img" src={item.couponGoodImage}/>
                                            <View className="list-item-header-text">
                                                <View className="name">{item.couponName}</View>
                                                <View>
                                                    <View className="sill">无门槛使用</View>
                                                    <View className="time">有效期至 {item.endTime}</View>
                                                </View>
                                            </View>
                                        </View>
                                        <Image className="list-item-header-right" src={icon}/>
                                    </View>
                                    <View className="list-item-desc">
                                        <Text>{ item.couponDescription }</Text>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View> :
                <Empty text="有些难为情，券不在"/>
            }
        </View>
    )
}

