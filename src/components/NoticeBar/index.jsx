import React from 'react';
import classNames from 'classnames';
import { View, Swiper, SwiperItem } from '@tarojs/components';

import './index.less';

export default (props) => {

    const list = props.list || [];

    return (
        <View className={classNames('wy-noticebar-wrap', props.className)}>
            <Swiper duration vertical className="wy-noticebar-content" autoplay duration={100} interval={3000}>
                {
                    list.map((v, index) => {
                        return (
                            <SwiperItem key={index}>{ props.renderItem(v) }</SwiperItem>
                        )
                    })
                }
            </Swiper>
        </View>
    )
}
