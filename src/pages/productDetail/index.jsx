import React, { useEffect, useState } from 'react'
import Taro, { useShareAppMessage, useReady } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'

import styles from './index.module.less'
import { fix } from '../../utils/utils'
import SafeArea from '../../components/SafeArea'
import NoticeBubble from '../../components/NoticeBubble'
import Upload from '../../components/Upload'
import WidthCompressCanvas from '@/layout/WidthCompressCanvas'
import SelectCoupon from '../../page-components/SelectCoupon'
import { detail as getDetail } from '../../services/product'

const BottomTips = () => {
    return (
        <View className={styles['bottom-tips']}>
            <Text>免费定制1个 限时特惠</Text>
        </View>
    )
}

const ProductDetail = ({ dispatch, confirmOrder, user }) => {

    const { coupon } = confirmOrder;

    const [query, setQuery] = useState({});
    const [detail, setDetail] = useState({});
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        getOrderDetail(query.id);
        if (query.type != 'display') {
            dispatch({
                type: 'confirmOrder/initConfirmOrder'
            })
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
            Taro.eventCenter.trigger('confirmSelectMatch', query.id);
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

    let priceText = `￥${fix(detail.sellingPrice, 2, true)}`;

    if (coupon.couponMethod == 2) {
        priceText = `券后￥${Math.abs(fix(detail.sellingPrice - coupon.couponOffer / 100, 2, true))}`
    }

    return (
        <View className={styles.index}>
            <View className={styles['banner-wrap']}>
                {
                    detail?.buyList?.length > 0 &&
                    <NoticeBubble className={styles['order-notice']} list={detail.buyList} renderItem={(v) => {
                        return <View className={styles['order-notice-item']}>{ v.cname }打印了{ v.printNums }张</View>
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
                        <Text className={styles['original']}>￥{fix(detail.originalPrice, 2, true)}</Text>
                    </View>
                    <View className={styles['product-name']}>{detail.name}</View>
                </View>
                <View className={styles['product-sale']}>销量 {detail.sales}</View>
            </View>
            <SelectCoupon productId={query.id} activeCoupon={coupon} onChange={saveCoupon}></SelectCoupon>
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
            <SafeArea>
                {({ bottom }) => {
                    return (
                        [4, 5, 6].includes(detail.category) ?
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

export default WidthCompressCanvas(connect(({ confirmOrder, user }) => ({
    confirmOrder,
    user
}))(ProductDetail));
