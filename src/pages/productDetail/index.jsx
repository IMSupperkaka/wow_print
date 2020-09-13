import React, { Component, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { View, Image, ScrollView, Swiper, Text, SwiperItem } from '@tarojs/components'

import './index.less'
import Modal from '../../components/Modal'
import iconCoupon from '../../../images/icon_coupon@2x.png'
import couponArrow from '../../../images/coin_Jump／3@2x.png'
import { detail as getDetail } from '../../services/product'

const ProductDetail = ({ dispatch, confirmOrder }) => {

  const { coupon } = confirmOrder;

  const [query, setQuery] = useState({});
  const [detail, setDetail] = useState({});
  const [current, setCurrent] = useState(0);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const query = Taro.getCurrentInstance().router.params;
    setQuery(query);
    getDetail({
      goodId: query.id
    }).then(({ data }) => {
      setDetail(data.data);
      if (data.data.couponList.length > 0) {
        saveCoupon(data.data.couponList[0])
      }
    })
  }, [])

  const saveCoupon = (coupon) => {
    dispatch({
      type: 'confirmOrder/saveCoupon',
      payload: coupon
    })
  }

  const handleOpenCoupon = () => {
    setIsOpened(true);
  }

  const handleCloseCoupon = () => {
    setIsOpened(false);
  }

  const goSelectPic = () => {
    dispatch({
      type: 'confirmOrder/saveGoodId',
      payload: query.id
    })
    Taro.navigateTo({
      url: `/pages/selectPic/index`
    })
  }

  const useCoupon = (item) => {
    saveCoupon(item);
    handleCloseCoupon();
  }

  const noUseCoupon = () => {
    saveCoupon({});
    handleCloseCoupon();
  }

  return (
    <View className="index">
      <View className="banner-wrap">
        <Swiper className="banner" current={current} onChange={(e) => {
          setCurrent(e.detail.current);
        }}>
          {
            detail?.productMainImages?.map((v, index) => {
              return (
                <SwiperItem key={index}>
                  <Image src={v} mode="aspectFill" />
                </SwiperItem>
              )
            })
          }
        </Swiper>
        <View className="indicator">
          {current + 1}/{detail?.productMainImages?.length}
        </View>
      </View>
      <View className="product-info">
        <View className="product-price">￥{(detail.sellingPrice / 100).toFixed(2)}</View>
        <View className="product-name">{detail.name}</View>
      </View>
      {
        detail?.couponList?.length > 0 &&
        <View className="coupon-cell" onClick={handleOpenCoupon}>
          <View>
            <Image src={iconCoupon} />
            优惠券
          </View>
          <View>
            {coupon.couponName || '请选择优惠券'}
            <Image src={couponArrow}/>
          </View>
        </View>
      }
      <View className="product-detail">
        <View className="detail-title">商品详情</View>
        {
          detail?.productDetailImages?.map((url) => {
            return <Image mode="widthFix" class="detail-image" src={url} />
          })
        }
      </View>
      <View onClick={goSelectPic} className="submit-btn">
        立即打印
      </View>
      <Modal className="coupon-modal" visible={isOpened} onClose={handleCloseCoupon}>
        <View className="title">优惠券</View>
        <ScrollView className="content" scrollY={true}>
          {
            (detail.couponList || []).map((item, index) => {
              return (
                <View className={classNames('list-item', coupon.id == item.id ? 'active' : '')} key={index}>
                  {
                    index == 0 &&
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
                    <View className="list-item-header-btn" onClick={useCoupon.bind(this, item)}>使用</View>
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
};

export default connect(({ confirmOrder }) => ({
  confirmOrder
}))(ProductDetail);
