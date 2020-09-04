import React, { useState, useEffect } from 'react'
import ListView from 'taro-listview'
import { usePullDownRefresh } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

export default () => {

    const [list, setList] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    usePullDownRefresh((rest) => {
        setTimeout(() => {
            rest();
        }, 1000)
    })

    const onScrollToLower = async (fn) => {
        setTimeout(() => {
            setList([
                {
                    title: 'asdasd'
                },
                {
                    title: 'asdasd'
                },
            ])
            fn();
        }, 1000)
    };

    return (
        <ListView
            hasMore={hasMore}
            style={{ height: '100vh' }}
            needInit={true}
            onScrollToLower={fn => onScrollToLower(fn)}
        >
            {
                list.map((item, index) => (
                    <View key={index}>
                        <Image className='avatar skeleton-radius' src={item.avatar} />
                        <View>
                            {item.title}
                        </View>
                        <View>
                            {item.value}
                        </View>
                    </View>
                ))
            }
        </ListView>
    )
}