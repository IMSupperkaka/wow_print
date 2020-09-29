import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { ScrollView, View, Image, Button, Text } from '@tarojs/components'

import './orderList.less'
import { orderStatus } from '../../utils/map/order'
import { list, repay, cancel, receipt, detail } from '../../services/order'
import Empty from '../../components/Empty'
import noOrderIcon from '../../../images/bg_no_order@2x.png'

export default (props) => {

    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        Taro.eventCenter.on('updateOrderStatus', (id) => {
            updateOrderStatus(id);
        })
        return () => {
            Taro.eventCenter.off('updateOrderStatus');
        }
    }, [])

    useEffect(() => {
        if (props.active) {
            onLoad();
        }
    }, [props.active])

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
        repay({
            loanId: order.id
        }).then(({ data }) => {
            Taro.requestPayment({
                timeStamp: data.data.timestamp,
                nonceStr: data.data.nonce_str,
                package: data.data.pay_package,
                signType: 'MD5',
                paySign: data.data.paysign,
                success: function (res) {
                    updateOrderStatus(order.id);
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_success&id=${order.id}`
                    })
                },
                fail: function (res) {
                    Taro.showToast({
                        title:'取消支付',
                        icon:'none',
                        duration:1000
                    })
                }
            })
        })
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
        detail({
            loanId: id
        }).then(({ data }) => {
            setRecords((records) => {
                const cloneList = [...records];
                const index = cloneList.findIndex((v) => {
                    return v.id == id;
                });
                if (index != -1) {
                    const item = cloneList[index];
                    item.status = data.data.status;
                    cloneList.splice(index, 1, item);
                    return cloneList;
                }
                return records;
            });
        })
    }

    return (
      <ScrollView onScrollToLower={onLoad.bind(this, false)} scrollY={true} style={{ height: '100%' }}>
            {
                records.length > 0 ?
                <View className='order-list'>
                    {
                        records.map((item, index) => {

                            const goodsInfo = item.goodsInfo[0];

                            return (
                                <View className='order-item' key={index} onClick={handleDetail.bind(this, item)}>
                                    <View className="order-item-header">
                                        <Text>共{ item.loanGoodsNums }件商品</Text>
                                        <Text className={(item.status != 4 && item.status != 5) ? 'primary' : ''}>{ orderStatus.get(item.status) }</Text>
                                    </View>
                                    <View className="order-item-content">
                                        <Image className="product-image" mode="aspectFill" src={goodsInfo.indexImage}/>
                                        <View className="product-content">
                                            <View>
                                                { goodsInfo.goodName }
                                            </View>
                                            <View>
                                                <Text>￥{ (goodsInfo.sellingPrice / 100).toFixed(2) }</Text>
                                                <Text>x{ goodsInfo.goodsNums }</Text>
                                            </View>
                                            <View>
                                                <Text>合计</Text>
                                                <Text>￥{ (item.money / 100).toFixed(2) }</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="orde-item-footer">
                                        {
                                            item.status == 2 &&
                                            <Button onClick={handleGoService} className="order-btn outline-btn">联系客服</Button>
                                        }
                                        {
                                            [3, 9].includes(item.status) &&
                                            <Button onClick={handleGoLog.bind(this, item)} className="order-btn outline-btn">查看物流</Button>
                                        }
                                        {
                                            [2, 4, 5, 9].includes(item.status) &&
                                            <Button onClick={handleDetail.bind(this, item)} className="order-btn outline-btn">查看订单</Button>
                                        }
                                        {
                                            item.status == 3 &&
                                            <Button onClick={handleReceived.bind(this, item)} className="order-btn primary-outline-btn">确认收货</Button>
                                        }
                                        {
                                            item.status == 1 &&
                                            <Button onClick={handleCancel.bind(this, item)} className="order-btn outline-btn">取消订单</Button>
                                        }
                                        {
                                            item.status == 1 &&
                                            <Button onClick={handleRepay.bind(this, item)} type="primary" className="order-btn primary-btn">立即付款</Button>
                                        }
                                    </View>
                                </View>
                            )
                        })
                    }
                </View> :
                <Empty src={noOrderIcon} text="想了想，确实没有订单"/>
            }
        </ScrollView>
    )
}

