import React, { useState } from 'react'
import { connect } from 'react-redux'
import Taro, { useDidShow, useReady } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text } from '@tarojs/components'

import './index.less'
import LazyImage from '@/components/LazyImage'
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

    const previewList = orderDetail?.goodsInfo?.[0]?.printPreviewList || [];

    return (
        <View className="page-container">
            <View>
                <Swiper
                    className='preview-swiper'
                    key={previewList.length}
                    skipHiddenItemLayout
                    onChange={handleOnChange}>
                    {
                        previewList.map((v, index) => {
                            return (
                                <SwiperItem className="preview-item" key={v.id}>
                                    <View className="preview-image-wrap">
                                        <Text className="print-nums">打印{ v.printNums }张</Text>
                                        <LazyImage className="preview-image" mode="widthFix" src={`${v.url}?imageMogr2/auto-orient/format/jpg/thumbnail/!540x540r/quality/80!/interlace/1/ignore-error/1`} width={640}/>
                                        <View className="pagenation">
                                            {index + 1}/{previewList.length}
                                        </View>
                                    </View>
                                </SwiperItem>
                            )
                        })
                    }
                </Swiper>
            </View>

            <View className="goback-btn" onClick={goBack}>
                返回
            </View>
        </View>
    )
}

export default Preview;
