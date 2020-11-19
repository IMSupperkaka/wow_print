import React, { useState, useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { connect } from 'react-redux'

import styles from './index.module.less'
import { fix } from '../../utils/utils'
import Card from '../../components/Card'
import SafeArea from '../../components/SafeArea'
import SelectCoupon from '../../page-components/SelectCoupon'
import ProductList from './productList'
import addressIcon from '../../../images/icon_address@2x.png'
import arrowIcon from '../../../images/coin_jump@2x.png'
import { create } from '../../services/order'
import { list } from '../../services/address'
import { detail as getDetail, getMatchList } from '../../services/product'

const NaN2Zero = (num) => {
    return isNaN(num) ? 0 : num;
}

const ConfirmOrder = ({ dispatch, confirmOrder }) => {

    const { addressInfo, coupon, goodId, userImageList } = confirmOrder;

    const [productDetail, setProductDetail] = useState({});
    const [matchList, setMatchList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        Taro.eventCenter.on('confirmSelectMatch', (id) => {
            setSelectedRowKeys((selectedRowKeys) => {
                return [...selectedRowKeys, id]
            });
        })
        return () => {
            Taro.eventCenter.off('confirmSelectMatch');
        }
    }, [])

    useDidShow(() => {
        list().then(({ data }) => {
            if (addressInfo.id) {
                const address = data.data.find((address) => {
                    return address.id == addressInfo.id;
                });
                dispatch({
                    type: 'confirmOrder/saveAddressInfo',
                    payload: address || {}
                })
            } else {
                const defaultAddress = data.data.find((address) => {
                    return address.isDefault == 1;
                });
                dispatch({
                    type: 'confirmOrder/saveAddressInfo',
                    payload: defaultAddress || {}
                })
            }
        })
        getMatchList({
            goodId: goodId
        }).then(({ data }) => {
            setMatchList(data.data.map((v) => {
                return {
                    ...v,
                    saleNum: 1
                }
            }));
        })
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
            goodsInfo: [
                {
                    goodIsMaster: 1,
                    goodsNums: 1,
                    goodId: goodId,
                    userImageList: userImageList
                },
                ...selectedRowKeys.map((id) => {
                    var item = matchList.find((v) => { return v.id == id });
                    return {
                        goodIsMaster: 0,
                        goodsNums: item.saleNum,
                        goodId: item.id
                    }
                })
            ]
        }).then(({ data }) => {
            Taro.requestPayment({
                timeStamp: data.data.payData.timestamp,
                nonceStr: data.data.payData.nonce_str,
                package: data.data.payData.pay_package,
                signType: 'MD5',
                paySign: data.data.payData.paysign,
                success: function (res) {
                    Taro.redirectTo({
                        url: `/pages/result/index?type=pay_success&id=${data.data.loanId}`
                    })
                },
                fail: function (res) {
                    Taro.redirectTo({
                        url: `/pages/result/index?type=pay_fail&id=${data.data.loanId}`
                    })
                },
                complete: () => {
                    Taro.eventCenter.trigger('finishOrder', goodId);
                }
            })
        })
    }

    const handleChooseAddress = () => {
        Taro.navigateTo({
            url: `/pages/addressList/index?type=choose`
        })
    }

    const saveCoupon = (coupon) => {
        dispatch({
            type: 'confirmOrder/saveCoupon',
            payload: coupon
        })
    }

    const freeShipMoney = fix(addressInfo.freeShippingMoney, 2);
    let shipMoney = fix(addressInfo.shipMoney, 2);
    const picNum = productDetail.category == 1 ? userImageList.reduce((count, v) => { return count + v.printNums }, 0) : 1;
    const discountNum = productDetail.category == 1 ? (coupon.couponFreeNums || 0) : 0;

    // 商品总价
    const productMoney = fix(productDetail.sellingPrice * (picNum <= 0 ? 0 : picNum), 2);
    // 优惠金额
    const discountMoney = discountNum * productDetail.sellingPrice / 100;
    // 搭配商品总价
    const matchMoney = matchList.filter((v) => { return selectedRowKeys.includes(v.id) }).reduce((count, v) => { return count + v.saleNum * v.sellingPrice }, 0) / 100;
    // 优惠后金额
    const afterDiscountMoney = Math.max(Number(productMoney) - Number(discountMoney), 0);
    // 券优惠了金额
    const couponDiscount = Math.min(Number(productMoney), Number(discountMoney))
    // (搭配总价 + 商品总价 - 优惠金额) 是否大于包邮金额
    if ((Number(matchMoney) + afterDiscountMoney) - freeShipMoney >= 0) {
        shipMoney = 0;
    }
    // 小计
    const totalMoney = (afterDiscountMoney + Number(shipMoney)).toFixed(2);
    // 支付金额
    const payMoney = (Number(matchMoney) + Number(totalMoney)).toFixed(2)

    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys)
        }
    };

    return (
        <View className={styles["index"]}>
            <Card bodyClassName={"address-info"} onClick={handleChooseAddress}>
                <Image src={addressIcon} className="location-icon"/>
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
            </Card>
            <Card bodyClassName="product-info">
                <View className="product-info-content">
                    <Image className="product-image" mode="aspectFill" src={productDetail?.productMainImages?.[0]} />
                    <View className="product-content">
                        <View className="picName">
                            {productDetail.name}
                        </View>
                        <View className="picNum">
                            <Text>￥{fix(productDetail.sellingPrice, 2)}</Text>
                            <Text>x{picNum}</Text>
                        </View>
                    </View>
                </View>
                <View className="product-pay-info">
                    <View className="product-pay-info-item">
                        <Text>商品总价</Text>
                        <Text>￥{NaN2Zero(productMoney)}</Text>
                    </View>
                    <SelectCoupon
                        productId={productDetail.id}
                        defaultActiveCoupon={coupon}
                        onChange={saveCoupon}
                        render={(coupon, couponList) => {
                            return (
                                <View className="product-pay-info-item">
                                    <View>
                                        <Text className="discount-title">优惠</Text>
                                        {
                                            coupon?.couponName && <Text>{coupon?.couponName}</Text>
                                        }
                                    </View>
                                    <View>
                                        {
                                           couponDiscount > 0 && <Text>-￥{NaN2Zero(couponDiscount)}</Text>
                                        }
                                        {
                                            !coupon?.couponName && <Text>{couponList?.length}张可用</Text>
                                        }
                                        <Image className="address-info__arrow" src={arrowIcon} />
                                    </View>
                                </View>
                            )
                        }}
                    />
                    <View className="product-pay-info-item">
                        <View>
                            <Text>运费</Text>
                            {
                                freeShipMoney &&
                                <Text>（满{NaN2Zero(freeShipMoney)}包邮）</Text>
                            }
                        </View>
                        <Text>￥{shipMoney}</Text>
                    </View>
                    <View className="product-pay-info-item">
                        <Text>小计</Text>
                        <Text>￥{NaN2Zero(totalMoney)}</Text>
                    </View>
                </View>
            </Card>
            {
                matchList.length > 0 &&
                <Card title="推荐搭配">
                    <ProductList list={matchList} rowSelection={rowSelection} onChange={setMatchList} />
                </Card>
            }
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className="submit-wrap">
                            <View className="left-info-con">
                                <Text className="info-item">合计</Text>
                                <Text className="info-item">￥</Text>
                                <Text className="info-item">{NaN2Zero(payMoney)}</Text>
                                <Text className="info-item">含运费{NaN2Zero(shipMoney)}元</Text>
                            </View>
                            <View onClick={submitOrder} className="right-sub-btn">提交订单</View>
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
