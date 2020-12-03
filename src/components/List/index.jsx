import React, { useEffect, useState } from 'react'
import Taro, { usePullDownRefresh, useReachBottom, useReady } from '@tarojs/taro'
import { View } from '@tarojs/components'

import Empty from '../../components/Empty'

export default (props) => {

    const { onLoad, onChange, isFinish } = props;

    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    usePullDownRefresh(() => {
        _onLoad(true);
    })

    useReachBottom(() => {
        _onLoad(false);
    })

    useEffect(() => {
        _onLoad(false);
    }, [])

    const _onLoad = (refresh = false) => {
        if (!refresh && isFinish) {
            return false;
        }
        onLoad(refresh).then(() => {
            Taro.stopPullDownRefresh();
        }).catch(() => {
            Taro.stopPullDownRefresh();
        })
    }

    const empty = props.empty || <Empty/>;

    return (
        <View>
            {
                props.children.length > 0 ?
                props.children :
                empty
            }
        </View>
    )
}

