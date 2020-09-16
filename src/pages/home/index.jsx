import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Taro, { usePageScroll, useReachBottom } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'

import './index.less'
import { list, index } from '../../services/home'
import NavBar from '../../components/NavBar'
import Dialog from '../../components/Dialog'

const Home = (props) => {

    const { dispatch, user: { dialog } } = props;

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

    useEffect(() => {
        onLoad();
        getConfig();
    }, [])

    usePageScroll((e) => {
        setScrollTop(e.scrollTop);
    })

    const getConfig = () => {
        index().then(({ data }) => {
            setHomeData(data.data);
        })
    }

    const onLoad = () => {
        return list({
            page: page.current + 1,
            pageSize: page.pageSize
        }).then(({ data }) => {
            setIsFinish(data.data.current >= data.data.pages);
            setRecords(records.concat(data.data.records));
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
            url: `/pages/productDetail/index?id=${id}`
        })
    }

    const handleClickDialog = () => {
        dispatch({
            type: 'user/clickDialog'
        })
    }

    const handleClose = () => {
        dispatch({
            type: 'user/clickDialog',
            payload: {
                close: true
            }
        })
    }

    return (
        <View className='index'>
            <NavBar style={navBarStyle} left={
                <View className="nav-left">
                    <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg" />
                    <Text>咔嚓熊魔法馆</Text>
                </View>
            } />
            <Swiper
                className='banner'
                circular
                autoplay>
                {
                    homeData.bannerList.map((v) => {
                        return (
                            <SwiperItem key={v.id}>
                                <Image mode="aspectFill" src={v.image} />
                            </SwiperItem>
                        )
                    })
                }
            </Swiper>
            <View className='promote-pic'>
                <Swiper
                    className='promote-swiper'
                    circular
                    autoplay>
                    {
                        homeData.indexBigImageList.map((v) => {
                            return (
                                <SwiperItem key={v.id}>
                                    <Image mode="aspectFill" src={v.image} />
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
                                    <Image src={product.indexImage} mode="aspectFill" />
                                    <View className="product-info">
                                        <View>{product.name}</View>
                                        <View>{product.description}</View>
                                        <View>￥<Text className="price">{(product.sellingPrice / 100).toFixed(2)}</Text></View>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
                <View className="bottom-text">更多商品  持续更新</View>
            </View>
            <Dialog visible={dialog.visible} className="home-dialog" onClose={handleClose}>
                <Image src={dialog.image} mode="widthFix" onClick={handleClickDialog}/>
            </Dialog>
        </View>
    )
}

export default connect(({ user }) => ({
    user
}))(Home);
