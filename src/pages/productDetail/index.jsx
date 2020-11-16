import React, { useState } from 'react'
import Taro, { useShareAppMessage, useReady } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'

import './index.less'
import { fix } from '../../utils/utils'
import Transition from '../../components/Transition'
import SafeArea from '../../components/SafeArea'
import NoticeBar from '../../components/NoticeBar'
import SelectCoupon from '../../page-components/SelectCoupon'
import { detail as getDetail } from '../../services/product'

const ProductDetail = ({ dispatch, confirmOrder, user }) => {

    const { coupon } = confirmOrder;

    const [query, setQuery] = useState({});
    const [detail, setDetail] = useState({});
    const [current, setCurrent] = useState(0);

    useReady(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        getOrderDetail(query.id);
        if (query.type != 'display') {
            dispatch({
                type: 'confirmOrder/initConfirmOrder'
            })
        }
    })

    useShareAppMessage();

    const getOrderDetail = (id) => {
        getDetail({
            goodId: id
        }).then(({ data }) => {
            setDetail(data.data);
        })
    }

    const saveCoupon = (coupon) => {
        dispatch({
            type: 'confirmOrder/saveCoupon',
            payload: coupon
        })
    }

    const goSelectPic = () => {

        if (detail.category == 0) {
            Taro.eventCenter.trigger('confirmSelectMatch', query.id);
            return Taro.navigateBack();
        }

        dispatch({
            type: 'confirmOrder/pushSeletPage',
            payload: {
                goodInfo: detail
            }
        })
    }

    const submitBtnText = detail.category == 0 ? '确认选择' : (coupon.couponName ? '免费打印' : '立即打印');

    return (
        <View className="index">
            <View className="banner-wrap">
                {
                    detail?.buyList?.length > 0 &&
                    <NoticeBar className="order-notice" list={detail.buyList} renderItem={(v) => {
                        return <View className="order-notice-item">{ v.cname }打印了{ v.printNums }张</View>
                    }}/>
                }
                <Swiper className="banner" current={current} onChange={(e) => {
                    setCurrent(e.detail.current);
                }}>
                    {
                        detail?.productMainImages?.map((v, index) => {
                            return (
                                <SwiperItem key={index} className="swiper-item">
                                    <Image src={v} mode="aspectFill" />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                <View className="indicator">
                    {current + 1} / {detail?.productMainImages?.length}
                </View>
            </View>
            <View className="product-info">
                <View>
                    <View className="product-price">￥{fix(detail.sellingPrice, 2)}</View>
                    <View className="product-name">{detail.name}</View>
                </View>
                <View className="product-sale">销量 {detail.sales}</View>
            </View>
            <SelectCoupon productId={query.id} defaultActiveCoupon={coupon} onChange={saveCoupon}></SelectCoupon>
            <View className="product-detail">
                <View className="detail-title">商品详情</View>
                {
                    detail?.productDetailImages?.map((url, index) => {
                        return <Image key={index} mode="widthFix" class="detail-image" src={url} />
                    })
                }
            </View>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <Transition in={detail.id} timeout={0} classNames="bottom-top">
                            <View style={{ paddingBottom: Taro.pxTransform(bottom) }} onClick={goSelectPic} className="submit-btn">
                                { submitBtnText }
                            </View>
                        </Transition>
                    )
                }}
            </SafeArea>
        </View>
    )
};

export default connect(({ confirmOrder, user }) => ({
    confirmOrder,
    user
}))(ProductDetail);
