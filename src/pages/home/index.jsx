import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Taro, { useDidShow, usePageScroll, useShareAppMessage } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'

import styles from './index.module.less';
import { jump } from '../../utils/utils'
import { list, index } from '../../services/home'
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
    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    useShareAppMessage();

    useDidShow(() => {
        if(Taro.getEnv() == 'WEB' && !sessionStorage.getItem('showed-falg')) {
            dispatch({
                type: 'home/getDialog'
            })
            if(sessionStorage.getItem('showed-falg') === false) {
                sessionStorage.setItem('showed-falg', true)
            }
        }
        onLoad(1);
        getConfig();
    });

    // TODO 封装usePageScroll
    usePageScroll(res => {
        setScrollTop(res.scrollTop);
    })

    useEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            document.querySelector('.taro-tabbar__panel').onscroll = (e) => {
                setScrollTop(e.target.scrollTop);
            }
        }
    }, [])

    const getConfig = () => {
        index().then(({ data }) => {
            setHomeData(data.data);
        })
    }

    const onLoad = (refresh) => {
        return list({
            page: refresh ? 1 : page.current + 1,
            pageSize: page.pageSize
        }).then(({ data }) => {
            setIsFinish(data.data.current >= data.data.pages);
            setRecords(refresh ? data.data.records : records.concat(data.data.records));
            setPage({
                current: data.data.current,
                pageSize: data.data.size,
                total: data.data.total
            })
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
            {process.env.TARO_ENV === 'weapp' && <AddToMine/>}
            <View className="banner-wrapper">
                <Swiper
                    // H5 更新Swiper key值，让Swiper重新渲染
                    key={homeData.bannerList.join('_')}
                    className="banner"
                    circular
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
                    // H5 更新Swiper key值，让Swiper重新渲染
                    key={homeData.indexBigImageList.join('_')}
                    className='promote-swiper'
                    circular
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
                <Image src={dialog.image} mode="widthFix" onClick={handleClickDialog} className="dialog-img"/>
            </Dialog>
        </View>
    )
}

export default connect(({ home }) => ({
    home
}))(Home);
