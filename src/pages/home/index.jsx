import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text, Swiper, Button, SwiperItem } from '@tarojs/components'
import { AtModal, AtModalHeader, AtModalContent, AtModalAction } from "taro-ui"
import './index.less'

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            productList: [
                {
                    name: '5寸LOMO卡',
                    describe: '进口星幻材质，高精印刷',
                    price: '4.98'
                },
                {
                    name: '6寸高清照片',
                    describe: '优质高清照，点缀回忆',
                    price: '4.98'
                }
            ],
            isOpened: true
        }
    }

    handleGoDetail = (id) => {
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${id}`
        })
    }

    render() {
        return (
            <View className='index'>
                <View className="fixed-header"></View>
                <Swiper
                    className='banner'
                    circular
                    autoplay>
                    <SwiperItem>
                        <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg"/>
                    </SwiperItem>
                    <SwiperItem>
                        <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg"/>
                    </SwiperItem>
                    <SwiperItem>
                        <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg"/>
                    </SwiperItem>
                </Swiper>
                <View className="promote-pic">
                    <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg"/>
                </View>
                <View className="content">
                    <View className="title">精挑细选</View>
                    <View className="product-list">
                        {
                            this.state.productList.map((product, index) => {
                                return (
                                    <View key={index} className="product-wrap" onClick={this.handleGoDetail.bind(this, product.id)}>
                                        <Image src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598590603816&di=45a66e123318babfefbcf7e78bfb699c&imgtype=0&src=http%3A%2F%2Fa2.att.hudong.com%2F86%2F10%2F01300000184180121920108394217.jpg"/>
                                        <View className="product-info">
                                            <View>{ product.name }</View>
                                            <View>{ product.describe }</View>
                                            <View>￥<Text className="price">{ product.price }</Text></View>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                    <View className="bottom-text">更多商品  持续更新</View>
                </View>
                <AtModal isOpened={this.state.isOpened}>
                    <AtModalContent>
                        这里是正文内容，欢迎加入京东凹凸实验室
                        这里是正文内容，欢迎加入京东凹凸实验室
                        这里是正文内容，欢迎加入京东凹凸实验室
                    </AtModalContent>
                </AtModal>
            </View>
        )
    }
}

export default Index

