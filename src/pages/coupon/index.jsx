import React, { Component } from 'react'
import { View, ScrollView, Button, Text } from '@tarojs/components'

import './index.less'

class Index extends Component {

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         refresherTriggered: false
    //     }
    // }

    constructor() {
        super(...arguments)
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
        console.log(e.detail)
    }

    render() {
        const scrollStyle = {
            height: '100%'
        }
        const scrollTop = 0
        const Threshold = 20
        const vStyleA = {
            height: '150px',
            'background-color': 'rgb(26, 173, 25)'
        }
        const vStyleB = {
            height: '150px',
            'background-color': 'rgb(39,130,215)'
        }
        const vStyleC = {
            height: '150px',
            'background-color': 'rgb(241,241,241)',
            color: '#333'
        }
        return (
            <View className='index'>
                <ScrollView
                    className='scrollview'
                    scrollY
                    scrollWithAnimation
                    scrollAnchoring
                    refresherEnabled
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
                        <View className='list-item'>

                        </View>
                    </View>
                </ScrollView>
            </View>
            
        )
    }
}

export default Index

