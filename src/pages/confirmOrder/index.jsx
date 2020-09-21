import React, { useState, useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { connect } from 'react-redux'

import './index.less'
import SafeArea from '../../components/SafeArea'
import addressIcon from '../../../images/矩形@2x.png'
import arrowIcon from '../../../images/coin_Jump／1@2x.png'
import { create } from '../../services/order'
import { detail as getDetail } from '../../services/product'

const ConfirmOrder = ({ confirmOrder }) => {

    const { addressInfo, coupon, goodId, userImageList } = confirmOrder

    const [productDetail, setProductDetail] = useState({});

    useDidShow(() => {
        getDetail({
            goodId: goodId
        }).then(({ data }) => {
            setProductDetail(data.data);
        })
    }, [])

    const submitOrder = () => {
        if (!addressInfo.id) {
            return Taro.showToast({
                title: '请选择收货地址',
                icon: 'none'
            })
        }
        create({
            addressId: addressInfo.id,
            couponUserId: coupon.id,
            goodsInfo: [{
                goodId: goodId,
                userImageList: userImageList
            }]
        }).then(({ data }) => {
            Taro.requestPayment({
                timeStamp: data.data.payData.timestamp,
                nonceStr: data.data.payData.nonce_str,
                package: data.data.payData.pay_package,
                signType: 'MD5',
                paySign: data.data.payData.paysign,
                success: function (res) {
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_success&id=${data.data.loanId}`
                    })
                },
                fail: function (res) {
                    Taro.navigateTo({
                        url: `/pages/result/index?type=pay_fail&id=${data.data.loanId}`
                    })
                }
            })
        })
    }

    const handleChooseAddress = () => {
        Taro.navigateTo({
            url: `/pages/addressList/index?type=choose`
        })
    }

    const handlePreview = () => {

    }

    const freeShipMoney = productDetail.freeShippingMoney / 100;
    let shipMoney = addressInfo.shipMoney / 100;
    const picNum = userImageList.reduce((count, v) => { return count + v.printNums }, 0);
    const payNum = picNum - (coupon.couponFreeNums || 0);
    const productMoney = productDetail.sellingPrice * (payNum <= 0 ? 0 : payNum) / 100;
    if (productMoney >= freeShipMoney) {
        shipMoney = 0;
    }
    const totalMoney = (shipMoney + productMoney).toFixed(2);

    return (
        <View className="index">
            <View className="address-info" onClick={handleChooseAddress}>
                <Image src={addressIcon} />
                <View className="address-info__body">
                    {
                        addressInfo.recipient ?
                            <>
                                <View className="address-info__title">{addressInfo.recipient} {addressInfo.phone}</View>
                                <View className="address-info__content">{addressInfo.province + addressInfo.city + addressInfo.area + addressInfo.address}</View>
                            </> :
                            <View className="address-info__title">请选择收货地址</View>
                    }
                    <View className="address-info__notify">支付成功后订单地址无法修改，请仔细确认哦～</View>
                </View>
                <Image className="address-info__arrow" src={arrowIcon} />
            </View>
            <View className="product-info">
                <View className="product-info-content" onClick={handlePreview}>
                    <Image className="product-image" mode="aspectFill" src={productDetail?.productMainImages?.[0]} />
                    <View className="product-content">
                        <View>
                            {productDetail.name}
                        </View>
                        <View>
                            <Text>￥{(productDetail.sellingPrice / 100).toFixed(2)}</Text>
                            <Text>x{picNum}</Text>
                        </View>
                    </View>
                </View>
                <View className="product-pay-info">
                    <View>
                        <Text>优惠券</Text>
                        <Text>{coupon.couponName || '未使用优惠券'}</Text>
                    </View>
                    <View>
                        <Text>运费</Text>
                        <Text>￥{shipMoney.toFixed(2)}</Text>
                    </View>
                    <View>
                        <Text>小计</Text>
                        <Text>￥{totalMoney}</Text>
                    </View>
                </View>
            </View>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20) }} className="submit-wrap">
                            <View>
                                <Text>合计</Text>
                                <Text>￥</Text>
                                <Text>{totalMoney}</Text>
                            </View>
                            <View onClick={submitOrder}>提交订单</View>
                        </View>
                    )
                }}
            </SafeArea>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(ConfirmOrder);
