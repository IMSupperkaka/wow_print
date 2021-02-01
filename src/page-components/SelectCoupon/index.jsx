import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { View, ScrollView, Image, Text } from '@tarojs/components';

import styles from './index.module.less';
import { Modal, Empty } from '@/components';
import { detail as getDetail } from '@/services/product';
import iconCoupon from '@/images/icon_coupon@2x.png';
import couponArrow from '@/images/coin_jump@3x.png';
import bgNoCoupons from '@/images/icon_coupons.png';

const CouponItem = (props) => {

    const { item: { new: isNew, couponGoodImage, couponName, freeContent, endTime, couponDescription }, disabled, ...restProps } = props;

    return (
        <View {...restProps}>
            {
                isNew &&
                <View className="top">
                    <View className="triangle"></View>
                    <Text className="new">新</Text>
                </View>
            }
            <View className='list-item-header'>
                <View className="list-item-header-left">
                    <Image className="coupon-img" src={couponGoodImage} />
                    <View className="list-item-header-text">
                        <View className="name">{couponName}</View>
                        <View>
                            <View className="sill">{freeContent}</View>
                            <View className="time">有效期至 {endTime}</View>
                        </View>
                    </View>
                </View>
                {
                    !disabled &&
                    <View className="list-item-header-btn">使用</View>
                }
            </View>
            <View className="list-item-desc">
                <Text>{couponDescription}</Text>
            </View>
        </View>
    )
}

export default (props) => {

    const { productId, activeCoupon, render, money, onChange: propsOnChange } = props;

    const [isOpened, setIsOpened] = useState(false);

    const [detail, setDetail] = useState({});

    const [couponList, setCouponList] = useState([]);

    const [disabledCouponList, setDisabledCouponList] = useState([]);

    const filterCouponList = (couponList || []).filter((coupon) => {
        if (coupon.couponMethod == 2 && money) {
            return coupon.couponUseConditionMoney <= money;
        }
        return true;
    })

    const onChange = (coupon) => {
        propsOnChange(coupon);
    }

    useEffect(() => {
        Taro.eventCenter.on('finishOrder', (id) => {
            getOrderDetail(id);
        })
    }, [])

    useEffect(() => {
        if (productId) {
            getOrderDetail(productId);
        }
    }, [productId])

    useEffect(() => {
        if (detail.category != 0) {
            if (filterCouponList.length > 0) {
                onChange(filterCouponList[0])
            } else {
                onChange({
                    id: null,
                    couponFreeNums: 0
                })
            }
        }
    }, [filterCouponList.map(v => v.id).join(','), detail, money])

    const getOrderDetail = (id) => {
        getDetail({
            goodId: id
        }).then(({ data }) => {
            setDetail(data.data);
            const currentTime = new Date().getTime();
            setDisabledCouponList(data.data.couponDisableList.map(() => {
                return {
                    ...v,
                    new: (currentTime - new Date(v.createTime)) <= 86400000
                }
            }));
            setCouponList(data.data.couponList.map((v) => {
                return {
                    ...v,
                    new: (currentTime - new Date(v.createTime)) <= 86400000
                }
            }))
        })
    }

    const handleOpenCoupon = () => {
        setIsOpened(true);
    }

    const handleCloseCoupon = () => {
        setIsOpened(false);
    }

    const handleUseCoupon = (item) => {
        onChange(item);
        handleCloseCoupon();
    }

    const noUseCoupon = () => {
        onChange({
            id: null,
            noUse: true,
            couponFreeNums: 0
        });
        handleCloseCoupon();
    }

    const activeCouponItem = couponList.find((v) => {
        return v.id == activeCoupon.id;
    });

    let cellComponent = typeof render === 'function' ?
        render(activeCouponItem, filterCouponList) :
        (
            <View className={styles["coupon-cell"]}>
                <View className={styles["coupon-left"]}>
                    <Image className={styles["coupon-icon"]} src={iconCoupon} />
                优惠券
            </View>
                <View className={styles["coupon-right"]}>
                    {
                        filterCouponList.length > 0 &&
                        (activeCouponItem?.couponName || `${filterCouponList?.length}张可用`)
                    }
                    <Image src={couponArrow} className={styles["coupon-arrow"]} />
                </View>
            </View>
        )

    cellComponent = cellComponent && React.cloneElement(cellComponent, {
        onClick: () => {
            handleOpenCoupon();
        }
    })

    return (
        <View>
            { cellComponent}
            <Modal className={styles["coupon-modal"]} visible={isOpened} onClose={handleCloseCoupon}>
                <View className="title">优惠券</View>
                <ScrollView className={styles['content']} scrollY={true}>
                    {
                        filterCouponList.length <= 0 &&
                        <Empty src={bgNoCoupons} text="无可用优惠券哦~" />
                    }
                    {
                        filterCouponList.map((item, index) => {
                            return (
                                <CouponItem
                                    onClick={() => { handleUseCoupon(item) }}
                                    className={classNames('list-item', activeCoupon.id == item.id ? 'active' : '')}
                                    key={item.id}
                                    item={item}
                                />
                            )
                        })
                    }
                    {
                        disabledCouponList.length > 0 &&
                        <>
                            <View className={styles['disabled-content']}>
                                <View className={styles['disabled-title']}>不可使用优惠券</View>
                                {
                                    disabledCouponList.map((item, index) => {
                                        return (
                                            <CouponItem
                                                className={classNames('list-item', activeCoupon.id == item.id ? 'active' : '')}
                                                key={item.id}
                                                item={item}
                                                disabled
                                            />
                                        )
                                    })
                                }
                            </View>
                        </>
                    }
                </ScrollView>
                {
                    filterCouponList.length > 0 &&
                    <View className="footer" onClick={noUseCoupon}>不使用优惠券</View>
                }
            </Modal>
        </View>
    )
}
