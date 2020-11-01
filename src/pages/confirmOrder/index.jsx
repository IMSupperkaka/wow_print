import React, { useState, useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { connect } from 'react-redux'

import './index.less'
import { fix } from '../../utils/utils'
import Card from '../../components/Card'
import SafeArea from '../../components/SafeArea'
import ProductList from './productList'
import addressIcon from '../../../images/icon_address@2x.png'
import arrowIcon from '../../../images/coin_jump@2x.png'
import { create } from '../../services/order'
import { list } from '../../services/address'
import { detail as getDetail, list as getProductList } from '../../services/product'

const ConfirmOrder = ({ dispatch, confirmOrder }) => {

    const { addressInfo, coupon, goodId, userImageList } = confirmOrder;

    const [productDetail, setProductDetail] = useState({});
    const [matchList, setMatchList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
        getProductList({
          goodId: goodId
        }).then(({ data }) => {
          if (data.data.records.length > 0) {
            setSelectedRowKeys([data.data.records[0].id]);
          }
          setMatchList(data.data.records.map((v) => {
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

    const freeShipMoney = fix(addressInfo.freeShippingMoney, 2);
    let shipMoney = fix(addressInfo.shipMoney, 2);
    const picNum = userImageList.reduce((count, v) => { return count + v.printNums }, 0);
    const payNum = picNum - (coupon.couponFreeNums || 0);
    const productMoney = fix(productDetail.sellingPrice * (payNum <= 0 ? 0 : payNum), 2);

    if (productMoney - freeShipMoney >= 0) {
        shipMoney = 0;
    }

    const matchMoney = matchList.filter((v) => { return selectedRowKeys.includes(v.id) }).reduce((count, v) => { return count + v.saleNum * v.sellingPrice }, 0) / 100;

    const totalMoney = (Number(shipMoney) + Number(productMoney)).toFixed(2);

    const payMoney = (Number(totalMoney) + matchMoney).toFixed(2)

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (selectedRowKeys) => {
        setSelectedRowKeys(selectedRowKeys)
      }
    };

    return (
        <View className="index">
            <Card bodyClassName="address-info" onClick={handleChooseAddress}>
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
            </Card>
            <Card bodyClassName="product-info">
                <View className="product-info-content">
                    <Image className="product-image" mode="aspectFill" src={productDetail?.productMainImages?.[0]} />
                    <View className="product-content">
                        <View>
                            {productDetail.name}
                        </View>
                        <View>
                            <Text>￥{fix(productDetail.sellingPrice, 2)}</Text>
                            <Text>x{picNum}</Text>
                        </View>
                    </View>
                </View>
                <View className="product-pay-info">
                    <View>
                        <Text>商品总价</Text>
                        <Text>￥{productMoney}</Text>
                    </View>
                    <View>
                        <Text>优惠</Text>
                        <Text>{coupon.couponName || '未使用优惠券'}</Text>
                    </View>
                    <View>
                        <View>
                            <Text>运费</Text>
                            {
                                freeShipMoney &&
                                <Text>（满{ freeShipMoney }包邮）</Text>
                            }
                        </View>
                        <Text>￥{shipMoney}</Text>
                    </View>
                    <View>
                        <Text>小计</Text>
                        <Text>￥{totalMoney}</Text>
                    </View>
                </View>
            </Card>
            <Card title="推荐搭配">
              <ProductList list={matchList} rowSelection={rowSelection} onChange={setMatchList}/>
            </Card>
            <SafeArea>
                {({ bottom }) => {
                    return (
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20) }} className="submit-wrap">
                            <View>
                                <Text>合计</Text>
                                <Text>￥</Text>
                                <Text>{payMoney}</Text>
                                <Text>含运费{shipMoney}元</Text>
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
