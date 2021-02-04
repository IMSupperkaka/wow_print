import React, { useState, useEffect } from 'react'
import math from '@/utils/math'
import classnames from 'classnames'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'

import styles from './index.module.less'
import { renderMoney, getRouterParams } from '@/utils/utils'
import Base, { useDidShow } from '../../layout/Base'
import Card from '@/components/Card'
import Pay from '@/components/Pay'
import Step from '@/components/Step'
import Devide from '@/components/Devide'
import SafeArea from '@/components/SafeArea'
import SelectCoupon from '../../page-components/SelectCoupon'
import ProductList from './productList'
import addressIcon from '@/images/icon_address@2x.png'
import arrowIcon from '@/images/coin_jump@2x.png'
import { create } from '@/services/order'
import { list } from '@/services/address'
import { detail as getDetail, getMatchList } from '@/services/product'

const ConfirmOrder = ({ dispatch, confirmOrder }) => {

    const { addressInfo, coupon, goodId, userImageList } = confirmOrder;
    
    const [productDetail, setProductDetail] = useState({
        sellingPrice: 0
    });
    
    const [matchList, setMatchList] = useState([]);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [goodsNums, setGoodsNums] = useState(1);

    const { payProps, openPay } = Pay.usePay({
        confirmPay: ({ payType }) => {
            return create({
                addressId: addressInfo.id,
                couponUserId: coupon.id,
                payMethod: payType,
                goodsInfo: [
                    {
                        goodIsMaster: 1,
                        goodsNums: goodsNums,
                        goodId: goodId,
                        userImageList: userImageList.map((v) => {
                            return {
                                ...v,
                                filePath: null
                            }
                        })
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
            }).then((res) => {
                return {
                    payData: res.data.data.payData,
                    loanId: res.data.data.loanId
                }
            })
        },
        onSuccess: ({ params, response: { loanId } }) => {
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_success&id=${loanId}`
            })
        },
        onFail: ({ params, response: { loanId } }) => {
            Taro.redirectTo({
                url: `/pages/result/index?type=pay_fail&id=${loanId}&money=${params.money}`
            })
        },
        onComplete: () => {
            Taro.eventCenter.trigger('finishOrder', goodId);
        }
    });

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

        const id = getRouterParams('id');
        
        if (id) {
            dispatch({
                type: 'confirmOrder/getDetail',
                payload: id
            });
        } else {
            init();
        }

    })

    const init = () => {
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
    }

    const submitOrder = () => {
        if (!addressInfo.id) {
            return Taro.showToast({
                title: '请选择收货地址',
                icon: 'none'
            })
        }
        openPay({
            money: payMoney
        });
    }

    const handleChooseAddress = () => {
        Taro.navigateTo({
            url: `/pages/addressList/index?type=choose`
        })
    }

    const handleBack = () => {
        Taro.navigateBack();
    }

    const saveCoupon = (coupon) => {
        dispatch({
            type: 'confirmOrder/saveCoupon',
            payload: coupon
        })
    }

    const freeShipMoney = addressInfo.freeShippingMoney || 0;
    let shipMoney = addressInfo.shipMoney || 0;
    const picNum = productDetail.category == 1 ? userImageList.reduce((count, v) => { return count + v.printNums }, 0) : goodsNums;
    const discountNum = productDetail.category == 1 ? (coupon.couponFreeNums || 0) : 0;

    // 商品总价
    const productMoney = productDetail.sellingPrice * (picNum <= 0 ? 0 : picNum);

    let discountMoney = 0;

    if (coupon.couponMethod == 1) { // 免费打印券
        discountMoney = math.chain(discountNum).multiply(productDetail.sellingPrice).done(); // 优惠金额
    } else if (coupon.couponMethod == 2) { // 满减券
        if (productMoney >= coupon.couponUseConditionMoney) { // 满足满减条件
            discountMoney = coupon.couponOffer;
        }
    }
    
    // 搭配商品总价
    const matchMoney = matchList.filter((v) => { return selectedRowKeys.includes(v.id) }).reduce((count, v) => { return count + v.saleNum * v.sellingPrice }, 0);
    // 优惠后金额
    const afterDiscountMoney = Math.max(math.subtract(productMoney, discountMoney), 0);
    // 券优惠了金额
    const couponDiscount = Math.min(productMoney, discountMoney);
    // (搭配总价 + 商品总价 - 优惠金额) 是否大于包邮金额
    if (math.chain(matchMoney).add(afterDiscountMoney).subtract(freeShipMoney).done() >= 0) {
        shipMoney = 0;
    }
    // 小计
    const totalMoney = math.add(afterDiscountMoney, shipMoney);
    // 支付金额
    const payMoney = math.add(matchMoney, totalMoney);

    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys)
        }
    };

    return (
        <View className={styles["index"]}>
            <Card bodyClassName={styles['address-info']} onClick={handleChooseAddress}>
                <Image src={addressIcon} className={styles['location-icon']}/>
                <View className={styles['address-info__body']}>
                    {
                        addressInfo.recipient ?
                            <>
                                <View className={styles['address-info__title']}>{addressInfo.recipient} {addressInfo.phone}</View>
                                <View className={styles['address-info__content']}>{addressInfo.province + addressInfo.city + addressInfo.area + addressInfo.address}</View>
                            </> :
                            <View className={styles['address-info__title']}>请选择收货地址</View>
                    }
                    <View className={styles['address-info__notify']}>支付成功后订单地址无法修改，请仔细确认哦～</View>
                </View>
                <Image className={styles['address-info__arrow']} src={arrowIcon} />
            </Card>
            <Card bodyClassName="product-info">
                <View className={styles['product-info-content']}>
                    <Image className={styles['product-image']} mode="aspectFill" src={productDetail?.productMainImages?.[0]} />
                    <View className={styles['product-content']}>
                        <View className={styles['picName']}>
                            {productDetail.name}
                            <View className={styles['edit']} onClick={handleBack}>
                                编辑
                                <Image className={styles['address-info__arrow']} src={arrowIcon} />
                            </View>
                        </View>
                        <View className={styles['picNum']}>
                            <Text>￥{renderMoney(productDetail.sellingPrice)}</Text>
                            <Text>x{picNum}</Text>
                        </View>
                    </View>
                </View>
                <View className={styles['product-pay-info']}>
                    {
                        [0, 2, 3, 4, 5].includes(productDetail.category) &&
                        <View className={styles['product-pay-info-item']}>
                            <Text>购买数量</Text>
                            <Step value={goodsNums} max={productDetail.stock == null ? Infinity : productDetail.stock} onChange={setGoodsNums}/>
                        </View>
                    }
                    <View className={styles['product-pay-info-item']}>
                        <Text>商品总价</Text>
                        <Text>￥{renderMoney(productMoney)}</Text>
                    </View>
                    <SelectCoupon
                        productId={productDetail.id}
                        activeCoupon={coupon}
                        onChange={saveCoupon}
                        money={productMoney}
                        render={(coupon, couponList) => {
                            return (
                                couponList?.length > 0 &&
                                <View className={styles['product-pay-info-item']}>
                                    <View>
                                        <Text className={styles['discount-title']}>优惠</Text>
                                        {
                                            coupon?.couponName && <Text>{coupon?.couponName}</Text>
                                        }
                                    </View>
                                    <View className={styles['product-pay-info-item-value']}>
                                        {
                                           couponDiscount > 0 && <Text>-￥{renderMoney(couponDiscount)}</Text>
                                        }
                                        {
                                            !coupon?.couponName && <Text>{couponList?.length}张可用</Text>
                                        }
                                        <Image className={styles['address-info__arrow']} src={arrowIcon} />
                                    </View>
                                </View>
                            )
                        }}
                    />
                    <View className={styles['product-pay-info-item']}>
                        <View>
                            <Text>运费</Text>
                            {
                                freeShipMoney &&
                                <Text>（满{renderMoney(freeShipMoney)}包邮）</Text>
                            }
                        </View>
                        <Text>￥{renderMoney(shipMoney)}</Text>
                    </View>
                    <Devide/>
                    <View className={classnames(styles['product-pay-info-item'], styles['product-pay-info-item-last'])}>
                        <Text>小计</Text>
                        <Text className={styles['money']}>￥{renderMoney(totalMoney)}</Text>
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
                        <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className={styles['submit-wrap']}>
                            <View className={styles['left-info-con']}>
                                <Text className={styles['info-item']}>合计</Text>
                                <Text className={styles['info-item']}>￥</Text>
                                <Text className={styles['info-item']}>{renderMoney(payMoney)}</Text>
                                <Text className={styles['info-item']}>含运费{renderMoney(shipMoney)}元</Text>
                            </View>
                            <View onClick={submitOrder} className={styles['right-sub-btn']}>提交订单</View>
                        </View>
                    )
                }}
            </SafeArea>
            <Pay {...payProps}/>
        </View>
    )
}

export default Base(connect(({ confirmOrder }) => ({
    confirmOrder
}))(ConfirmOrder));
