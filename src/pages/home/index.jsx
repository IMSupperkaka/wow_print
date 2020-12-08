import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Taro, { usePageScroll, useShareAppMessage } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'

import styles from './index.module.less'
import { jump } from '../../utils/utils'
import { list, index } from '../../services/home'
import Base, { useDidShow } from '../../layout/Base'
import useList from '../../hooks/useList'
import NavBar from '../../components/NavBar'
import Dialog from '../../components/Dialog'
import AddToMine from '../../components/AddToMine'
import logo from '../../../images/bg_kachaxionglogo@2x.png'

const Home = (props) => {

    const { dispatch, home: { dialog } } = props;

    const [scrollTop, setScrollTop] = useState(0);
    
    const [homeData, setHomeData] = useState({
        bannerList: [],
        indexBigImageList: [],
        popupsList: []
    });

    const { records } = useList({
        onLoad: ({ current, pageSize }) => {
            return list({
                pageNum: current,
                pageSize: pageSize
            }).then(({ data }) => {
                return {
                    list: data.data.records,
                    total: data.data.total,
                    current: data.data.current
                }
            })
        }
    })

    useShareAppMessage();

    useDidShow(() => {
        if (process.env.TARO_ENV === 'h5' && JSON.parse(sessionStorage.getItem('show_flag'))) {
            dispatch({
                type: 'home/getDialog'
            })
            sessionStorage.setItem('show_flag', false)
        }
    });

    // TODO 封装usePageScroll
    usePageScroll(res => {
        setScrollTop(res.scrollTop);
    })

    useEffect(() => {
        getConfig();
    }, [])

    const getConfig = () => {
        index().then(({ data }) => {
            setHomeData(data.data);
        })
    }

    const percent = scrollTop / 150;

    const navBarStyle = {
        backgroundColor: `rgba(255,255,255,${percent * 1})`,
        color: `rgba(${255 * (1 - percent)},${255 * (1 - percent)},${255 * (1 - percent)},1)`
    }

    const handleGoDetail = (id) => {
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${id}`,
            complete: () => {
                console.log(1)
            }
        })
    }

    const handleClickDialog = () => {
        dispatch({
            type: 'home/clickDialog'
        })
    }

    const handleClose = () => {
        dispatch({
            type: 'home/clickDialog',
            payload: {
                close: true
            }
        })
    }

    return (
        <View className={styles['index']}>
            <NavBar style={navBarStyle} left={
                <View className={styles.navLeft}>
                    <Image className={styles.navLogo} src={logo} />
                    <Text>哇印</Text>
                </View>
            } />
            {process.env.TARO_ENV === 'weapp' && <AddToMine />}
            <View className="banner-wrapper">
                <Swiper
                    key={homeData.bannerList.length}
                    className="banner"
                    autoplay
                >
                    {
                        homeData.bannerList.map((v) => {
                            return (
                                <SwiperItem key={v.id} onClick={() => { jump(v.url) }}>
                                    <Image className="banner-image" mode="aspectFill" src={v.image} />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
            </View>

            <View className='promote-pic'>
                <Swiper
                    key={homeData.indexBigImageList.length}
                    className='promote-swiper'
                    autoplay>
                    {
                        homeData.indexBigImageList.map((v) => {
                            return (
                                <SwiperItem key={v.id} onClick={() => { jump(v.url) }}>
                                    <Image className="promote-image" mode="aspectFill" src={v.image} />
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
            </View>
            <View className="content">
                <View className="title">精挑细选</View>
                <View className="product-list">
                    {
                        records.map((product, index) => {
                            return (
                                <View key={index} className="product-wrap" onClick={handleGoDetail.bind(this, product.id)}>
                                    <Image className="product-image" src={product.indexImage} mode="aspectFill" />
                                    <View className="product-info">
                                        <View className="product-name">{product.name}</View>
                                        <View className="product-description">{product.description}</View>
                                        <View className="product-price">￥<Text className="price">{(product.sellingPrice / 100).toFixed(2)}</Text></View>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
                <View className="bottom-text">更多商品  持续更新</View>
            </View>
            <Dialog visible={dialog.visible} className="home-dialog" onClose={handleClose}>
                <Image src={dialog.image} mode="widthFix" onClick={handleClickDialog} className="dialog-img" />
            </Dialog>
        </View>
    )
}

export default Base(connect(({ home }) => ({
    home
}))(Home));
