import React, { useState } from 'react'
import { connect } from 'react-redux'
import Taro, { useDidShow, useReady } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text } from '@tarojs/components'

import './index.less'
import { detail } from '../../services/order'

const Preview = () => {

    const [orderDetail, setOrderDetail] = useState({
        goodsInfo: []
    });

    const [current, setCurrent] = useState(0);

    useReady(() => {
        const query = Taro.getCurrentInstance().router.params;
        detail({
            loanId: query.id
        }).then(({ data }) => {
            setOrderDetail(data.data);
        })
    })

    const goBack = () => {
        Taro.navigateBack();
    }

    const handleOnChange = (e) => {
        setCurrent(e.detail.current);
    }

    return (
        <View className="page-container">

            <View>
                <Swiper
                    className='preview-swiper'
                    circular
                    autoplay
                    onChange={handleOnChange}>
                    {
                        orderDetail?.goodsInfo?.[0]?.userImageList.map((v) => {
                            return (
                                <SwiperItem className="preview-item" key={v.id}>
                                    <Image className="preview-image" mode="aspectFill" src={v.cropImage} />
                                    <Text className="print-nums">打印{ v.printNums }张</Text>
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                <View className="pagenation">
                    {current + 1}/{orderDetail?.goodsInfo?.[0]?.userImageList.length}
                </View>
            </View>

            <View className="goback-btn" onClick={goBack}>
                返回
            </View>
        </View>
    )
}

export default Preview;
