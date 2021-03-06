import React, { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import classNames from 'classnames';
import { View, Image, Button, Text } from '@tarojs/components'

import styles from './index.module.less'
import Devide from '@/components/Devide'
import { detail, repay, cancel, receipt } from '@/services/order'
import Base, { useDidShow } from '../../layout/Base'
import { orderStatus } from '@/utils/map/order'
import address from '@/images/icon_address@2x.png'
import Pay from '@/components/Pay'
import day from 'dayjs';

export default Base((props) => {

    const { router } = props;

    const [orderDetail, setOrderDetail] = useState({
        goodsInfo: []
    });

    const timer = useRef();

    const [countDown, setCountDown] = useState(null);

    const getDetail = (params) => {
        detail(params).then(({ data }) => {
            setOrderDetail(data.data);
            if(data.data.status == 1) {
                createTimer(data.data.expiredTime);
            }
        })
    }

    const { payProps, openPay } = Pay.usePay({
        confirmPay: ({ payType, params }) => {
            return repay({
                payMethod: payType,
                loanId: router.query.id
            }).then((res) => {
                return {
                    payData: res.data.data,
                    loanId: router.query.id
                }
            })
        },
        onSuccess: () => {
            Taro.eventCenter.trigger('updateOrderStatus', router.query.id);
            Taro.navigateTo({
                url: `/pages/result/index?type=pay_success&id=${router.query.id}`
            })
        },
        onFail: ({ params }) => {
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_fail&id=${router.query.id}&money=${params.money}`
            })
        }
    })

    useDidShow(() => {
        getDetail({
            loanId: router.query.id
        })
    })

    const createTimer = (expiredTime) => {
        let closeTime = day(expiredTime).valueOf();
        let currentTime = day().valueOf();
        if(closeTime - currentTime <= 0) {
            return
        }
        setCountDown(turnHMS(closeTime - currentTime));
        timer.current = setInterval(() => {
            currentTime = day().valueOf();
            let timeSub = closeTime - currentTime
            if (timeSub > 0) {
                setCountDown(turnHMS(timeSub));
            }
        }, 1000)
    }

    useEffect(() => {
        if(countDown === '00:00:00') {
            clearInterval(timer.current)
        }
        return () => { clearInterval(timer.current) }
    }, [])

    useEffect(() => {
        if(countDown === '00:00:00') {
            clearInterval(timer.current);
            getDetail({
                loanId: router.query.id
            });
        }
    }, [countDown])

    // 时间戳差值转换时分秒
    const turnHMS = (time) => {
        let hms = time / 1000;
        let hour = parseInt(hms / (60 * 60), 10);
        let minutes = parseInt((hms % (60 * 60)) / 60, 10);
        let seconds = parseInt((hms % (60 * 60)) % 60, 10);
        hms = `${hour.toString().length == 2 ? hour : '0' + hour}:${minutes.toString().length == 2 ? minutes : '0' + minutes}:${seconds.toString().length == 2 ? seconds : '0' + seconds}`
        return hms
    }

    const handleCancel = () => {
        Taro.showModal({
            title: '确认取消',
            content: '是否确认取消订单',
            confirmText: '确认',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    cancel({
                        loanId: router.query.id
                    }).then(() => {
                        Taro.eventCenter.trigger('updateOrderStatus', router.query.id)
                        Taro.navigateTo({
                            url: `/pages/result/index?type=cancel&id=${router.query.id}`
                        })
                    })
                }
            }
        })
    }

    const handleRepay = () => {
        openPay({
            money: orderDetail.money
        });
    }

    const handleCopy = (data) => {
        Taro.setClipboardData({
            data: data,
            success: function (res) {
                Taro.showToast({
                    title: '订单号已复制',
                    icon: 'none',
                    duration: 1000
                })
            }
        })
    }

    const handleGoService = () => {
        Taro.navigateTo({
            url: '/pages/service/index'
        })
    }

    const goPreview = (e) => {

        e.preventDefault();
        e.stopPropagation();

        if (orderDetail.imageSynthesisStatus != 1) {
            return Taro.showToast({
                title: '杰作生成中，稍后再看哦',
                icon: 'none',
                duration: 1000
            })
        }

        if (orderDetail.goodsInfo[0].goodType == 2) {
            return Taro.navigateTo({
                url: `/pages/productDetail/index?id=${orderDetail.goodsInfo[0].goodId}`
            })
        }

        Taro.navigateTo({
            url: `/pages/preview/index?id=${router.query.id}`
        })
    }

    const handleReceived = () => {
        Taro.showModal({
            title: '确认收货',
            content: '确认已收到商品？非质量问题无法退货退款哦～',
            confirmText: '确认收货',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    receipt({
                        loanId: router.query.id
                    }).then(() => {
                        Taro.eventCenter.trigger('updateOrderStatus', router.query.id);
                        Taro.navigateTo({
                            url: `/pages/result/index?type=received&id=${router.query.id}`
                        })
                    })
                }
            }
        })
    }

    const handleChooseAddress = () => {
        Taro.navigateTo({
            url: `/pages/addressList/index?type=change&id=${router.query.id}`
        })
    }

    const handleGoLog = () => {
        Taro.navigateTo({
            url: `/pages/logisticsDetails/index?id=${router.query.id}`
        })
    }

    const handleGoDetail = (product) => {
        if (product.goodIsMaster != 1) {
            return;
        }
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${product.goodId}`
        })
    }

    const greyHeader = [4, 5, 6].includes(orderDetail.status);

    const productMoney = (orderDetail.money / 100 + (orderDetail.status == 6 ? (orderDetail.discountMoney / 100) : 0) - orderDetail.shipMoney / 100).toFixed(2);

    const totalMoney = (orderDetail.money / 100 + (orderDetail.status != 6 ? 0 : (orderDetail.discountMoney / 100))).toFixed(2)

    return (
        <View className={styles["order-detail"]}>
            <View className={classNames('header', greyHeader && 'grey')}>
                <Text>{orderStatus.get(orderDetail.status)}</Text>
                {
                    orderDetail.status == 1 && orderDetail.expiredTime &&
                    <Text className="count-down">{countDown}后订单关闭</Text>
                }
            </View>
            <View className="address-info">
                <Image src={address} className="position-icon" />
                <View className="address">
                    <View className="address-item">{orderDetail.recipient} {orderDetail.phone}</View>
                    <View className="address-item">{orderDetail.province + orderDetail.city + orderDetail.area + orderDetail.address}</View>
                </View>
            </View>
            <View className="product-info">
                {
                    orderDetail.goodsInfo.map((goodsInfo, index) => {
                        return (
                            <View key={index} className="product-info-content" onClick={handleGoDetail.bind(this, goodsInfo)}>
                                <Image className="product-image" mode="aspectFill" src={goodsInfo.indexImage} />
                                <View className="product-content">
                                    <View className="product-list">
                                        <View className="product-name">
                                            {goodsInfo.goodName}
                                            {
                                                goodsInfo.goodIsMaster == 0 &&
                                                <View className="match-icon">搭配</View>
                                            }
                                        </View>
                                        {
                                            (goodsInfo.goodIsMaster == 1 && [2, 3].includes(orderDetail.status)) &&
                                            <View onClick={goPreview} className="preview-btn">
                                                预览
                                                <AtIcon value='chevron-right' size='12' color='#666'></AtIcon>
                                            </View>
                                        }
                                    </View>
                                    <View className="num-content">
                                        <Text>￥{(goodsInfo.sellingPrice / 100).toFixed(2)}</Text>
                                        <Text>x{goodsInfo.goodsNums}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
                <View className="product-pay-info">
                    <View className="pay-item">
                        <Text>商品总价</Text>
                        <Text>￥{productMoney}</Text>
                    </View>
                    {
                        (orderDetail.couponName && orderDetail.status != 6) &&
                        <View className="pay-item">
                            <Text>优惠</Text>
                            <Text>-{orderDetail.discountMoney / 100}</Text>
                        </View>
                    }
                    <View className="pay-item">
                        <Text>运费</Text>
                        <Text>￥{(orderDetail.shipMoney / 100).toFixed(2)}</Text>
                    </View>
                    <Devide/>
                    <View className="pay-item">
                        <Text>合计</Text>
                        <Text className="total-amount">￥{totalMoney}</Text>
                    </View>
                </View>
            </View>
            <View className="order-info">
                <View className="order-info-item">
                    <View>订单编号</View>
                    <View>
                        <Text>{orderDetail.loanNo}</Text>
                        <Text onClick={handleCopy.bind(this, orderDetail.loanNo)} className="copy">复制</Text>
                    </View>
                </View>
                {
                    orderDetail.status != 1 &&
                    <View className="order-info-item">
                        <View>支付方式</View>
                        <View>
                            {orderDetail.payMethod == 1 ? '微信支付' : '支付宝支付'}
                        </View>
                    </View>
                }
                <View className="order-info-item">
                    <View>创建时间</View>
                    <View>
                        {orderDetail.createTime}
                    </View>
                </View>
            </View>
            <View className="submit-bar">
                {
                    [2, 3, 4, 5, 9].includes(orderDetail.status) &&
                    <Button onClick={handleGoService} className="radius-btn outline-btn">联系客服</Button>
                }
                {
                    orderDetail.status == 3 &&
                    <Button onClick={handleGoLog} className="radius-btn primary-outline-btn">查看物流</Button>
                }
                {
                    orderDetail.status == 3 &&
                    <Button onClick={handleReceived} className="radius-btn primary-outline-btn">确认收货</Button>
                }
                {
                    orderDetail.status == 1 &&
                    <Button onClick={handleChooseAddress} className="radius-btn outline-btn">修改地址</Button>
                }
                {
                    orderDetail.status == 1 &&
                    <Button onClick={handleCancel} className="radius-btn outline-btn">取消订单</Button>
                }
                {
                    orderDetail.status == 1 &&
                    <Button onClick={handleRepay} className="radius-btn primary-btn">立即付款</Button>
                }
            </View>
            <Pay {...payProps} />
        </View>
    )
})
