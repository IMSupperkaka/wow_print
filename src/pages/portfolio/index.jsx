import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { View, Image, Button } from '@tarojs/components';

import styles from './index.module.less';
import { Empty, List } from '@/components';
import { list as getList, detail, deleteWork } from '@/services/portfolio';

const Portfolio = ({ dispatch }) => {

    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    const [isFinish, setIsFinish] = useState(false);

    const [list, setList] = useState([]);

    const getData = (refresh = false) => {
        const current = refresh ? 1 : page.current + 1;
        const pageSize = page.pageSize;

        return getList({
            pageNum: current,
            pageSize: pageSize
        }).then(({ data }) => {
            setPage({
                current,
                pageSize,
                total: data.data.total
            })
            if (refresh) {
                setList(data.data.records)
            } else {
                setList((list) => {
                    return list.concat(data.data.records)
                })
            }
            setIsFinish(current >= Math.ceil(data.data.total / pageSize));
        })
    }

    const handleGoDetail = (item) => {
        detail({
            portfolioId: item.id
        }).then(({ data }) => {
            dispatch({
                type: 'confirmOrder/pushSeletPage',
                payload: {
                    goConfirmOrder: item.finishPage == item.totalPage,
                    goodInfo: data.data.goodsDetail,
                    portfolioId: item.id,
                    userImageList: data.data.imageList.map((v) => {
                        if (v?.originImage) {
                            return {
                                ...v,
                                filePath: `${v.originImage}?imageMogr2/auto-orient/format/jpg/thumbnail/!540x540r/quality/80!/interlace/1/ignore-error/1`,
                                status: 'done'
                            }
                        }
                        return v;
                    })
                }
            })
        })
    }

    // const handleDelete = (item) => {
    //     Taro.showModal({
    //         title: '确认删除',
    //         content: '确认将会删除该作品集以及包含的所有照片',
    //         confirmText: '确认',
    //         cancelText: '取消',
    //         confirmColor: '#FF6345',
    //         success: (res) => {
    //             if (res.confirm) {
    //                 deleteWork(item.id).then(() => {
    //                     const cloneList = [...list];
    //                     const index = cloneList.findIndex((v) => { return v.id == item.id });
    //                     cloneList.splice(index, 1);
    //                     setList(cloneList);
    //                 })
    //             }
    //         }
    //     })
    // }

    return (
        <View className={styles['portfolio-list']}>
            <List onLoad={getData} isFinish={isFinish} empty={<Empty text="暂无作品哦"/>}>
                {
                    list.map((item) => {
                        return (
                            <View className={styles['portfolio-item']} onClick={(e) => { handleGoDetail(item, e) }}>
                                <View className={styles['portfolio-left']}>
                                    <View className={styles['portfolio-img-wrap']}>
                                        <Image className={styles['portfolio-img']} src={item.indexImage}/>
                                    </View>
                                    <View className={styles['portfolio-info']}>
                                        <View>
                                            <View className={styles['portfolio-title']}>
                                                { item.name }
                                                {
                                                    item.coupon &&
                                                    <View className={styles['coupon-sign']}>优惠券</View>
                                                }
                                            </View>
                                            <View className={styles['portfolio-page']}>完成页码: { item.finishPage } / { item.totalPage }</View>
                                        </View>
                                        <View className={styles['portfolio-time']}>创作时间: { item.updateTime.split(' ')[0] }</View>
                                    </View>
                                </View>
                                <Button className={classnames('primary-outline-btn', 'radius-btn')}>
                                    {
                                        item.finishPage < item.totalPage ?
                                        '继续创作' :
                                        '购买'
                                    }
                                </Button>
                            </View>
                        )
                    })
                }
            </List>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(Portfolio);
