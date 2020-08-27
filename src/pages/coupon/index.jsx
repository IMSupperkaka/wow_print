import React, { Component } from 'react'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'

import './index.less'

import waitpayPng from '../../../images/shop.jpg';
import rightArrow from '../../../images/right_arrow@2x.png';

class Index extends Component {

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         refresherTriggered: false
    //     }
    // }

    constructor() {
        super(...arguments);
        this.state = {
            page: 0,
            count: 0,
            list: [1,2,3,4]
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    onScrollToUpper() { }

    // or 使用箭头函数
    // onScrollToUpper = () => {}

    onScroll(e) {
        // console.log(e.detail)
    }

    render() {
        const scrollStyle = {
            height: '100vh'
        }
        const scrollTop = 0
        const Threshold = 20
        return (
            <View className='index'>
                <ScrollView
                    className='scrollview'
                    scrollY
                    scrollWithAnimation
                    scrollAnchoring
                    refresherEnabled
                    refresherThreshold="30"
                    scrollTop={scrollTop}
                    style={scrollStyle}
                    lowerThreshold={Threshold}
                    upperThreshold={Threshold}
                    onScrollToUpper={this.onScrollToUpper.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
                    onScroll={this.onScroll}
                >
                    <View className='tips'>
                        <Text>温馨提示，每个订单只能使用一张优惠券哦～</Text>
                    </View>
                    <View className='list'>
                        {
                            this.state.list.map((item, index) => {
                                return (
                                    <View className='list-item'>
                                        { 
                                            index == 0 && 
                                            <View className="top">
                                                <View className="triangle"></View>
                                                <Text className="new">新</Text>
                                            </View> 
                                        }
                                        <View className='list-item-header'>
                                            <View className="list-item-header-left">
                                                <Image src={waitpayPng}/>
                                                <View className="list-item-header-text">
                                                    <View className="name">6寸照片打印券10张</View>
                                                    <View>
                                                        <View className="sill">无门槛使用</View>
                                                        <View className="time">有效期至 2020.8.24</View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View className="list-item-header-btn">使用</View>
                                        </View>
                                        <View className="list-item-desc">
                                            <Text>适用6寸lomo卡，优惠券将在您结算时自动抵扣</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                    <View className="fotter">
                         <Text>更多历史优惠券</Text>
                         <Image src={rightArrow}/>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default Index

