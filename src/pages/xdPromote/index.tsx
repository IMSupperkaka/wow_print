import React, { useState, useEffect } from 'react';
import Taro, { useReady } from '@tarojs/taro';
import classNames from 'classnames';
import { View, Image, Button } from '@tarojs/components';

import Base from '../../hoc/Base';
import { couponStatus } from '@/utils/map/coupon';
import Dialog from '@/components/Dialog';
import { receive, channelCouponList } from '@/services/coupon';
import './index.less';

export default Base(() => {

    const [visible, setVisible] = useState(false);
    const [couponList, setCouponList] = useState([]);

    useEffect(() => {
        receive().then(() => {
            return channelCouponList();
        }).then(({ data }) => {
            setCouponList(data.data);
            setVisible(true);
        })
    }, [])

    const goDetail = (id) => {
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${id}`
        })
    }

    const goHome = () => {
        Taro.switchTab({
            url: '/pages/home/index'
        })
    }

    return (
        <View>
            <Image className="head-banner" mode="widthFix" src="https://cdn.wanqiandaikuan.com/%E5%B0%8F%E7%94%B5x%E5%93%87%E5%8D%B0%E6%B4%BB%E5%8A%A8.png"/>
            <View className="product-box">
                {
                    couponList.map((coupon, index) => {
                        let imgSrc = 'https://cdn.wanqiandaikuan.com/5%E5%AF%B8%E5%95%86%E5%93%81.png'; 
                        if (index == 1) {
                            imgSrc= 'https://cdn.wanqiandaikuan.com/4%20%E5%AF%B8%E5%95%86%E5%93%81.png';
                        }
                        if (index == 2) {
                            imgSrc = 'https://cdn.wanqiandaikuan.com/6%E5%AF%B8%E5%95%86%E5%93%81min.png';
                        }
                        return (
                            <View className={index == 0 ? 'product-main' : 'product-sub'}>
                                <Image className="background" mode="widthFix" src={imgSrc}/>
                                <View className="product-content">
                                    <View className="product-info">
                                        <View className="product-name">{ coupon.goodName }</View>
                                        <View className="coupon-name">{ coupon.couponName }</View>
                                    </View>
                                    <Button onClick={() => { goDetail(coupon.goodId) }} className="radius-btn primary-btn">去使用</Button>
                                </View>
                            </View>
                        )
                    })
                }
            </View>
            <View className="content">
                <View className="title">使用规则</View>
                <View className="desc">
                    1.优惠规则：小电用户可使用价值25.4元超额优惠券，在（哇印）微信小程序内抵扣对应张数商品，券后商品0元，仅需支付邮费，内蒙古、甘肃、海南、宁夏、青海这些区16（满20包邮)、新疆、西藏24（满28包邮)，其他城市8元（满18元包邮）
                </View>
                <View className="desc">
                    2.有效期：权益自领取后15天内有效（含领券当天），未使用过期不可退换，已领取的优惠券可在平台底栏优惠券处查看，点击可以直接购买，自动抵扣时请注意查看张数
                </View>
                <View className="desc">
                    3.权益提供方：杭州哇印科技有限公司
                </View>
                <View className="desc">
                    4.客服：如有疑问可关注公众号“哇印定制”联系客服人员。在线时间：周一到周日9:30-18:00
                </View>
                <View className="desc">
                    5.发货时间：定制商品下单后需要进行生产，发货时间为下单后的2-4个工作日，请耐心等待哦
                </View>
                <View className="desc">
                    tips：上传的照片建议高清一些，照片质量是由上传照片质量决定的哦～
                </View>
            </View>
            <Dialog visible={visible} className="xd-dialog" onClose={() => { setVisible(false) }}>
                <View className="title">～领取成功～</View>
                {
                    couponList.map((v) => {
                        return (
                            <View className={classNames("coupon-box", v.status == 1 ? 'active' : null)}>
                                <View className="left">
                                    <View>{ v.goodName }</View>
                                    <View>{ v.couponName }</View>
                                </View>
                                <View className="right" onClick={() => { v.status == 1 && goDetail(v.goodId) }}>
                                    {
                                        v.status == 1 ? '立即打印' : (couponStatus.get(v.status))
                                    }
                                </View>
                            </View>
                        )
                    })
                }
                <View className="tips">优惠券有效期：自领取15天内有效</View>
                {
                    couponList.filter((v) => { return v.status != 1 }).length > 0 &&
                    <View className="getmore-coupon" onClick={goHome}>获取更多券</View>
                }
            </Dialog>
        </View>
    )
})
