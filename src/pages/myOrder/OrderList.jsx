import React, { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { ScrollView, View, Image, Button, Text } from '@tarojs/components'

import styles from './orderList.module.less'
import { orderStatus } from '../../utils/map/order'
import { list, repay, cancel, receipt, detail } from '../../services/order'
import Empty from '../../components/Empty'
import Pay from '../../components/Pay'
import noOrderIcon from '../../../images/bg_no_order@2x.png'

export default (props) => {

    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    const { payProps, openPay, params } = Pay.usePay({
        confirmPay: ({ payType, params }) => {
            return repay({
                payMethod: payType,
                loanId: params.id
            }).then((res) => {
                return {
                    payData: res.data.data,
                    loanId: params.id
                }
            })
        },
        onSuccess: ({ params }) => {
            Taro.navigateTo({
                url: `/pages/result/index?type=pay_success&id=${params.id}`
            })
        },
        onFail: ({ params }) => {
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_fail&id=${params.id}&money=${params.money}`
            })
        }
    });

    useEffect(() => {
        onLoad(true);
        Taro.eventCenter.on('updateOrderStatus', (id) => {
            onLoad(true);
        })
        return () => {
            Taro.eventCenter.off('updateOrderStatus');
        }
    }, [])

    const onLoad = (refresh = false) => {
        if (!refresh && isFinish) {
            return false;
        }
        const requestPage = refresh ? 1 : page.current + 1;
        return list({
            status: props.status || 0,
            pageNum: requestPage,
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
        })
    }

    const handleCancel = (order, e) => {
        e.stopPropagation();
        Taro.showModal({
            title: '确认取消',
            content: '是否确认取消订单',
            confirmText: '确认',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    cancel({
                        loanId: order.id
                    }).then(() => {
                        updateOrderStatus(order.id);
                        Taro.navigateTo({
                            url: `/pages/result/index?type=cancel&id=${order.id}`
                        })
                    })
                }
            }
        })
    }

    const handleReceived = (order, e) => {
        e.stopPropagation();
        Taro.showModal({
            title: '确认收货',
            content: '确认已收到商品？非质量问题无法退货退款哦～',
            confirmText: '确认收货',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    receipt({
                        loanId: order.id
                    }).then(() => {
                        updateOrderStatus(order.id);
                        Taro.navigateTo({
                            url: `/pages/result/index?type=received&id=${order.id}`
                        })
                    })
                }
            }
        })
    }

    const handleRepay = (order, e) => {
        e.stopPropagation();
        openPay({
            ...order,
            money: order.money
        });
    }

    const handleDetail = (order, e) => {
        e.stopPropagation();
        Taro.navigateTo({
            url: `/pages/orderDetail/index?id=${order.id}`
        })
    }

    const handleGoService = (e) => {
        e.stopPropagation();
        Taro.navigateTo({
            url: '/pages/service/index'
        })
    }

    const handleGoLog = (order, e) => {
        e.stopPropagation();
        Taro.navigateTo({
            url: `/pages/logisticsDetails/index?id=${order.id}`
        })
    }

    const updateOrderStatus = (id) => {
        onLoad(true);
        // detail({
        //     loanId: id
        // }).then(({ data }) => {
        //     setRecords((records) => {
        //         const cloneList = [...records];
        //         const index = cloneList.findIndex((v) => {
        //             return v.id == id;
        //         });
        //         if (index != -1) {
        //             const item = cloneList[index];
        //             item.status = data.data.status;
        //             cloneList.splice(index, 1, item);
        //             return cloneList;
        //         }
        //         return records;
        //     });
        // })
    }

    return (
        <ScrollView className={styles['order-list-scroll']} onScrollToLower={onLoad.bind(this, false)} scrollY={true} style={{ height: '100%' }}>
            {
                records.length > 0 ?
                    <View className={styles['order-list']}>
                        {
                            records.map((item, index) => {

                                const totalMoney = (item.money / 100 + (item.status != 6 ? 0 : (item.discountMoney / 100))).toFixed(2)

                                return (
                                    <View className={styles['order-item']} key={index} onClick={handleDetail.bind(this, item)}>
                                        <View className={styles['order-item-header']}>
                                            <Text className={styles['order-item-header__count']}>共{item.loanGoodsNums}件商品</Text>
                                            <Text className={(item.status != 4 && item.status != 5) ? 'primary' : ''}>{orderStatus.get(item.status)}</Text>
                                        </View>
                                        {
                                            item.goodsInfo.map((goodsInfo, index) => {
                                                return (
                                                    <View className={styles['order-item-content']} key={index}>
                                                        <Image className={styles['product-image']} mode="aspectFill" src={goodsInfo.indexImage} />
                                                        <View className={styles['product-content']}>
                                                            <View className={styles['product-goodsname']}>
                                                                {goodsInfo.goodName}
                                                            </View>
                                                            <View className={styles['product-price']}>
                                                                <Text>￥{(goodsInfo.sellingPrice / 100).toFixed(2)}</Text>
                                                                <Text>x{goodsInfo.goodsNums}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )
                                            })
                                        }
                                        <View className={styles['orde-item-footer']}>
                                            <View className={styles['orde-item-footer__left']}>
                                                <Text>合计</Text>
                                                <Text className={styles['orde-item-footer__price']}>￥{totalMoney}</Text>
                                            </View>
                                            <View className={styles['orde-item-footer__right']}>
                                                {
                                                    item.status == 2 &&
                                                    <Button onClick={handleGoService} className={classnames('radius-btn', 'outline-btn', styles['order-btn'])}>联系客服</Button>
                                                }
                                                {
                                                    [3, 9].includes(item.status) &&
                                                    <Button onClick={handleGoLog.bind(this, item)} className={classnames('radius-btn', 'outline-btn', styles['order-btn'])}>查看物流</Button>
                                                }
                                                {
                                                    [2, 4, 5, 9].includes(item.status) &&
                                                    <Button onClick={handleDetail.bind(this, item)} className={classnames('radius-btn', 'outline-btn', styles['order-btn'])}>查看订单</Button>
                                                }
                                                {
                                                    item.status == 3 &&
                                                    <Button onClick={handleReceived.bind(this, item)} className={classnames('radius-btn', 'primary-outline-btn', styles['order-btn'])}>确认收货</Button>
                                                }
                                                {
                                                    item.status == 1 &&
                                                    <Button onClick={handleCancel.bind(this, item)} className={classnames('radius-btn', 'outline-btn', styles['order-btn'])}>取消订单</Button>
                                                }
                                                {
                                                    item.status == 1 &&
                                                    <Button onClick={handleRepay.bind(this, item)} className={classnames('radius-btn', 'primary-btn', styles['order-btn'])}>立即付款</Button>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View> :
                    <Empty src={noOrderIcon} text="想了想，确实没有订单" />
            }
            <Pay {...payProps} />
        </ScrollView>
    )
}

