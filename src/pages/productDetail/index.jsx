import React, { useState } from 'react'
import Taro, { useShareAppMessage, useReady } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'

import styles from './index.module.less'
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

    let submitBtnText = detail.category == 0 ? '确认选择' : (coupon.couponName ? '免费打印' : '立即打印');

    if (detail.category == 2 || detail.category == 3) {
        submitBtnText = '立即定制';
    }

    return (
        <View className={styles.index}>
            <View className={styles['banner-wrap']}>
                {
                    detail?.buyList?.length > 0 &&
                    <NoticeBar className={styles['order-notice']} list={detail.buyList} renderItem={(v) => {
                        return <View className={styles['order-notice-item']}>{ v.cname }打印了{ v.printNums }张</View>
                    }}/>
                }
                <Swiper className={styles['banner']} current={current} onChange={(e) => {
                    setCurrent(e.detail.current);
                }}>
                    {
                        detail?.productMainImages?.map((v, index) => {
                            return (
                                <SwiperItem key={index} className={styles['swiper-item']}>
                                    <Image className={styles['banner-image']} src={v} mode="aspectFill" />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                <View className={styles['indicator']}>
                    {current + 1} / {detail?.productMainImages?.length}
                </View>
            </View>
            <View className={styles['product-info']}>
                <View>
                    <View className={styles['product-price']}>￥{fix(detail.sellingPrice, 2)}</View>
                    <View className={styles['product-name']}>{detail.name}</View>
                </View>
                <View className={styles['product-sale']}>销量 {detail.sales}</View>
            </View>
            <SelectCoupon productId={query.id} defaultActiveCoupon={coupon} onChange={saveCoupon}></SelectCoupon>
            <View className={styles['product-detail']}>
                <View className={styles['detail-title']}>商品详情</View>
                {
                    detail?.productDetailImages?.map((url, index) => {
                        return <Image key={index} mode="widthFix" className={styles['detail-image']} src={url} />
                    })
                }
            </View>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <Transition in={detail.id} timeout={0} classNames={styles['bottom-top']}>
                            <View style={{ paddingBottom: Taro.pxTransform(bottom, 750) }} onClick={goSelectPic} className={styles['submit-btn']}>
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
