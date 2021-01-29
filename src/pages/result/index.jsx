import React from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'

import styles from './index.module.less'
import { repay } from '@/services/order'
import iconCancel from '@/images/icon_Order@2x.png'
import iconSuccess from '@/images/icon_success@2x.png'
import iconFail from '@/images/icon_failure@2x.png'
import iconReceived from '@/images/icon_Receipt@2x.png'
import Pay from '@/components/Pay'

const reslutType = new Map([
    ['cancel', { title: '订单已取消', icon: iconCancel }],
    ['received', { title: '收货成功', icon: iconReceived }],
    ['pay_success', { title: '支付成功', subTitle: '定制商品预计3-5个工作日内发货，请耐心等待', icon: iconSuccess }],
    ['pay_fail', { title: '支付失败', icon: iconFail }],
])

export default () => {

    const query = Taro.getCurrentInstance().router.params;
    const item = reslutType.get(query.type);

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
        onSuccess: () => {
            Taro.eventCenter.trigger('updateOrderStatus', query.id);
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_success&id=${query.id}`
            })
        },
        onFail: ({ params }) => {
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_fail&id=${query.id}&money=${params.money}`
            })
        }
    });

    const goHome = () => {
        Taro.reLaunch({
            url: '/pages/home/index'
        })
    }

    const goOrderDetail = () => {
        Taro.navigateTo({
            url: `/pages/orderDetail/index?id=${query.id}`
        })
    }

    const handleRepay = () => {
        openPay({
            id: query.id,
            money: query.money
        })
    }

    return (
        <View className={styles['result-wrap']}>
            <Image className={styles['icon']} src={item.icon}/>
            <View className={styles['title']}>{ item.title }</View>
            {
                item.subTitle &&
                <View className={styles['sub-title']}>{ item.subTitle }</View>
            }
            <View className={styles['btn-wrap']}>
                {
                    ['pay_success', 'cancel', 'received'].includes(query.type) &&
                    <Button onClick={goHome} className="radius-btn outline-btn">返回首页</Button>
                }
                {
                    ['pay_success', 'pay_fail', 'received', 'cancel'].includes(query.type) &&
                    <Button onClick={goOrderDetail} className="radius-btn outline-btn">查看订单</Button>
                }
                {
                    query.type == 'pay_fail' &&
                    <Button onClick={handleRepay} className="radius-btn primary-outline-btn">重新支付</Button>
                }
            </View>
            <Pay {...payProps} />
        </View>
    )
}
