import React, { useEffect, useState } from 'react'
import math from '@/utils/math'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'

import styles from './index.module.less'
import shutDown from '@/images/icon_shut_down@2x.png';
import { fix } from '@/utils/utils'
import Base from '../../layout/Base'
import SafeArea from '@/components/SafeArea'
import NoticeBubble from '@/components/NoticeBubble'
import Upload from '@/components/Upload'
import WidthCompressCanvas from '@/layout/WidthCompressCanvas'
import SelectCoupon from '../../page-components/SelectCoupon'
import { detail as getDetail } from '@/services/product'
import { ProductWithTemplate } from '../../utils/map/product'

const BottomTips = (props) => {
    return (
        props.visible &&
        <View className={styles['bottom-tips']}>
            <Text>免费定制 限时特惠</Text>
            <Image onClick={props.onClose} className={styles['bottom-close']} src={shutDown}/>
        </View>
    )
}

const ProductDetail = ({ dispatch, confirmOrder, router }) => {

    const { query } = router;

    const { coupon } = confirmOrder;

    const [detail, setDetail] = useState({
        sellingPrice: 0
    });
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        getOrderDetail(query.id);
        if (query.type != 'display') {
            console.log('initConfirmOrder useEffect')
            dispatch({
                type: 'confirmOrder/initConfirmOrder'
            })
        }
        if (query.from == 'coupon') {
            setVisible(true)
        }
    }, [])

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

        if (query.type == 'display') {
            Taro.eventCenter.trigger('confirmSelectMatch', Number(query.id));
            return Taro.navigateBack();
        }

        if (detail.category == 4) {
            return false;
        }

        dispatch({
            type: 'confirmOrder/pushSeletPage',
            payload: {
                goodInfo: detail
            }
        })
    }

    const handleUploadChange = (file, fileList) => {
        console.log('pushSeletPage 选择完照片', detail.category)
        if (file.status == 'done') {
            dispatch({
                type: 'confirmOrder/pushSeletPage',
                payload: {
                    goodInfo: detail,
                    stageFileList: [file]
                }
            })
        }
    }

    let submitBtnText = coupon.couponName ? '免费打印' : '立即打印';

    if (detail.category == 0) {
        submitBtnText = '立即购买';
    }

    if (detail.category == 2 || detail.category == 3) {
        submitBtnText = '立即定制';
    }

    let priceText = `￥${math.divide(detail.sellingPrice, 100)}`;

    if (coupon.couponMethod == 2) {
        const price = math.chain(detail.sellingPrice).subtract(coupon.couponOffer).divide(100).done();
        priceText = `券后￥${Math.abs(price)}`
    }

    return (
        <View className={styles.index}>
            <View className={styles['banner-wrap']}>
                {
                    detail?.buyList?.length > 0 &&
                    <NoticeBubble className={styles['order-notice']} list={detail.buyList} renderItem={(v) => {
                        return <View className={styles['order-notice-item']}>
                            {
                                detail.category == 1 ?
                                `${v.cname}打印了${v.printNums}张` :
                                `${v.cname}购买了${v.printNums}件`
                            }
                        </View>
                    }}/>
                }
                <Swiper
                    key={detail?.productMainImages?.join('_')}
                    className={styles['banner']} 
                    current={current} onChange={(e) => {
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
                    <View className={styles['product-price']}>
                        <Text>{priceText}</Text>
                        <Text className={styles['original']}>
                            ￥
                            <Text className={styles['discount']}>
                            {fix(detail.originalPrice, 2, true)}
                            </Text>
                        </Text>
                    </View>
                    <View className={styles['product-name']}>{detail.name}</View>
                </View>
                <View className={styles['product-sale']}>销量 {detail.sales}</View>
            </View>
            {
                query.type != 'display' &&
                <SelectCoupon productId={query.id} activeCoupon={coupon} onChange={saveCoupon} money={detail.sellingPrice}/>
            }
            <View className={styles['product-detail']}>
                <View className={styles['detail-title']}>商品详情</View>
                {
                    detail?.productDetailImages?.map((url, index) => {
                        return (
                            process.env.TARO_ENV === 'weapp' ? 
                            <Image key={index} mode="widthFix" className={styles['detail-image']} src={url}/> :
                            <img key={index} className={styles['detail-image']} src={url}/>
                        )
                    })
                }
            </View>
            <BottomTips visible={visible} onClose={() => { setVisible(false) }}/>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        ProductWithTemplate.get(detail.category) ?
                        <Upload limit={1} onChange={handleUploadChange}>
                            <View style={{ paddingBottom: Taro.pxTransform(bottom, 750) }} onClick={goSelectPic} className={styles['submit-btn']}>
                                上传照片
                            </View>
                        </Upload> :
                        <View style={{ paddingBottom: Taro.pxTransform(bottom, 750) }} onClick={goSelectPic} className={styles['submit-btn']}>
                            { submitBtnText }
                        </View>
                    )
                }}
            </SafeArea>
        </View>
    )
};

export default Base(
    WidthCompressCanvas(
        connect(
            ({ confirmOrder, user }) => ({
                confirmOrder,
                user
            })
        )(ProductDetail)
    )
);
