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

    const previewList = (orderDetail?.goodsInfo?.[0]?.userImageList || []).filter((v) => {
        return !v?.restInfo?.isBack;
    })

    return (
        <View className="page-container">
            <View>
                <Swiper
                    className='preview-swiper'
                    autoplay
                    key={previewList.length}
                    onChange={handleOnChange}>
                    {
                        previewList.map((v, index) => {
                            return (
                                <SwiperItem className="preview-item" key={v.id}>
                                    <View className="preview-image-wrap">
                                        <Text className="print-nums">打印{ v.printNums }张</Text>
                                        <Image className="preview-image" mode="widthFix" src={v.synthesisImage || v.cropImage} />
                                        <View className="pagenation">
                                            {index + 1}/{previewList.length}
                                        </View>
                                    </View>
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
                {/* TODO: swiper不支持自动撑高 */}
                {/* <View className="pagenation">
                    {current + 1}/{orderDetail?.goodsInfo?.[0]?.userImageList.length}
                </View> */}
            </View>

            <View className="goback-btn" onClick={goBack}>
                返回
            </View>
        </View>
    )
}

export default Preview;
