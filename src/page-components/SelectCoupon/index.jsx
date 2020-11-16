import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { View, ScrollView, Image, Text } from '@tarojs/components';

import './index.less';
import Modal from '../../components/Modal';
import { detail as getDetail } from '../../services/product';
import iconCoupon from '../../../images/icon_coupon@2x.png';
import couponArrow from '../../../images/coin_jump@3x.png';

export default (props) => {

    const { productId, defaultActiveCoupon, render, onChange: propsOnChange } = props;

    const [isOpened, setIsOpened] = useState(false);

    const [detail, setDetail] = useState({});

    const [couponList, setCouponList] = useState([]);

    const [activeCoupon, setActiveCoupon] = useState({});

    const onChange = (coupon) => {
        setActiveCoupon(coupon);
        propsOnChange(coupon);
    }

    useEffect(() => {
        Taro.eventCenter.on('finishOrder', (id) => {
            getOrderDetail(id);
        })
        // return () => {
        //     Taro.eventCenter.off('finishOrder');
        // }
    }, [])

    useEffect(() => {
        if (defaultActiveCoupon) {
            setActiveCoupon(defaultActiveCoupon);
        }
    }, [defaultActiveCoupon])

    useEffect(() => {
        if (productId) {
            getOrderDetail(productId);
        }
    }, [productId])

    const getOrderDetail = (id) => {
        getDetail({
            goodId: id
        }).then(({ data }) => {
            setDetail(data.data);
            const currentTime = new Date().getTime();
            setCouponList(data.data.couponList.map((v) => {
                return {
                    ...v,
                    new: (currentTime - new Date(v.createTime)) <= 86400000
                }
            }))
            // 是否有已选择的优惠券
            const resetCoupon = data.data.couponList.findIndex((v) => {
                return v.id == activeCoupon.id;
            }) == -1;
            if (!resetCoupon) {
                return false;
            }
            if (data.data.category != 0) {
                if (data.data.couponList.length > 0 && data.data.category == 1) {
                    onChange(data.data.couponList[0])
                } else {
                    onChange({
                        id: null,
                        couponFreeNums: 0
                    })
                }
            }
        })
    }

    const handleOpenCoupon = () => {
        setIsOpened(true);
    }

    const handleCloseCoupon = () => {
        setIsOpened(false);
    }

    const useCoupon = (item) => {
        onChange(item);
        handleCloseCoupon();
    }

    const noUseCoupon = () => {
        onChange({
            id: null,
            couponFreeNums: 0
        });
        handleCloseCoupon();
    }

    const activeCouponItem = couponList.find((v) => {
        return v.id == activeCoupon.id;
    });

    let cellComponent = typeof render === 'function' ?
    render(activeCouponItem) :
    (
        (couponList?.length > 0 && detail.category == 1) &&
        <View className="coupon-cell">
            <View>
                <Image src={iconCoupon} />
                    优惠券
                </View>
            <View>
                {activeCouponItem?.couponName || '请选择优惠券'}
                <Image src={couponArrow} />
            </View>
        </View>
    )
    
    cellComponent = cellComponent && React.cloneElement(cellComponent, {
        onClick: () => {
            if (couponList.length > 0) {
                handleOpenCoupon();
            }
        }
    })

    return (
        <View>
            { cellComponent }
            <Modal className="coupon-modal" visible={isOpened} onClose={handleCloseCoupon}>
                <View className="title">优惠券</View>
                <ScrollView className="content" scrollY={true}>
                    {
                        (couponList || []).map((item, index) => {
                            return (
                                <View onClick={useCoupon.bind(this, item)} className={classNames('list-item', activeCoupon.id == item.id ? 'active' : '')} key={index}>
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
}
