import React, { Component, useState, useEffect } from 'react'
import Taro, { useShareAppMessage, useDidShow, useReady } from '@tarojs/taro'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { View, Image, ScrollView, Swiper, Text, SwiperItem } from '@tarojs/components'

import './index.less'
import { fix } from '../../utils/utils'
import Modal from '../../components/Modal'
import SafeArea from '../../components/SafeArea'
import iconCoupon from '../../../images/icon_coupon@2x.png'
import couponArrow from '../../../images/coin_jump@3x.png'
import { detail as getDetail } from '../../services/product'

const ProductDetail = ({ dispatch, confirmOrder, user }) => {

    const { coupon } = confirmOrder;

    const [query, setQuery] = useState({});
    const [detail, setDetail] = useState({});
    const [current, setCurrent] = useState(0);
    const [isOpened, setIsOpened] = useState(false);

    useReady(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        dispatch({
            type: 'confirmOrder/initConfirmOrder'
        })
        getOrderDetail(query.id);
        Taro.eventCenter.on('finishOrder', (id) => {
            getOrderDetail(id);
        })
        return () => {
            Taro.eventCenter.off('finishOrder');
        }
    })

    useShareAppMessage();

    const getOrderDetail = (id) => {
        getDetail({
            goodId: id
        }).then(({ data }) => {
            const currentTime = new Date().getTime();
            data.data.couponList = data.data.couponList.map((v) => {
                return {
                    ...v,
                    new: (currentTime - new Date(v.createTime)) <= 86400000
                }
            })
            setDetail(data.data);
            if (data.data.couponList.length > 0) {
                saveCoupon(data.data.couponList[0])
            } else {
                saveCoupon({
                    id: null,
                    couponFreeNums: 0
                })
            }
        })
    }

    const saveCoupon = (coupon) => {
        dispatch({
            type: 'confirmOrder/saveCoupon',
            payload: coupon
        })
    }

    const handleOpenCoupon = () => {
        setIsOpened(true);
    }

    const handleCloseCoupon = () => {
        setIsOpened(false);
    }

    const goSelectPic = () => {
        Taro.getSetting({
            success: (res) => {
                dispatch({
                    type: 'confirmOrder/saveGoodId',
                    payload: query.id
                })
                if (!res.authSetting['scope.userInfo']) {
                    return Taro.navigateTo({
                        url: `/pages/authInfo/index?redirect=/pages/selectPic/index`
                    })
                }
                Taro.navigateTo({
                    url: `/pages/selectPic/index`
                })
            }
        })
    }

    const useCoupon = (item) => {
        saveCoupon(item);
        handleCloseCoupon();
    }

    const noUseCoupon = () => {
        saveCoupon({});
        handleCloseCoupon();
    }

    return (
        <View className="index">
            <View className="banner-wrap">
                <Swiper className="banner" current={current} onChange={(e) => {
                    setCurrent(e.detail.current);
                }}>
                    {
                        detail?.productMainImages?.map((v, index) => {
                            return (
                                <SwiperItem key={index}>
                                    <Image src={v} mode="aspectFill" />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                <View className="indicator">
                    {current + 1}/{detail?.productMainImages?.length}
                </View>
            </View>
            <View className="product-info">
                <View className="product-price">￥{fix(detail.sellingPrice, 2)}</View>
                <View className="product-name">{detail.name}</View>
            </View>
            {
                detail?.couponList?.length > 0 &&
                <View className="coupon-cell" onClick={handleOpenCoupon}>
                    <View>
                        <Image src={iconCoupon} />
                            优惠券
                        </View>
                    <View>
                        {coupon.couponName || '请选择优惠券'}
                        <Image src={couponArrow} />
                    </View>
                </View>
            }
            <View className="product-detail">
                <View className="detail-title">商品详情</View>
                {
                    detail?.productDetailImages?.map((url) => {
                        return <Image mode="widthFix" class="detail-image" src={url} />
                    })
                }
            </View>
            <SafeArea>
                {({ bottom }) => {
                    return <View style={{ paddingBottom: Taro.pxTransform(bottom) }} onClick={goSelectPic} className="submit-btn">{ coupon.couponName ? '免费打印' : '立即打印' }</View>
                }}
            </SafeArea>
            <Modal className="coupon-modal" visible={isOpened} onClose={handleCloseCoupon}>
                <View className="title">优惠券</View>
                <ScrollView className="content" scrollY={true}>
                    {
                        (detail.couponList || []).map((item, index) => {
                            return (
                                <View onClick={useCoupon.bind(this, item)} className={classNames('list-item', coupon.id == item.id ? 'active' : '')} key={index}>
                                    {
                                        item.new &&
                                        <View className="top">
                                            <View className="triangle"></View>
                                            <Text className="new">新</Text>
                                        </View>
                                    }
                                    <View className='list-item-header'>
                                        <View className="list-item-header-left">
                                            <Image src={item.couponGoodImage} />
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
                                        <Text>{item.couponDescription}</Text>
                                    </View>
                                </View>
                            )
                        })
                    }
                </ScrollView>
                <View className="footer" onClick={noUseCoupon}>不使用优惠券</View>
            </Modal>
        </View>
    )
};

export default connect(({ confirmOrder, user }) => ({
    confirmOrder,
    user
}))(ProductDetail);
