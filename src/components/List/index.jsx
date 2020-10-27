import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh, useReachBottom, useReady } from '@tarojs/taro'
import { View } from '@tarojs/components'

import Empty from '../../components/Empty'

export default (props) => {

    const { onLoad } = props;
    const [isFinish, setIsFinish] = useState(false);
    const [records, setRecords] = useState([]);
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

    useReady(() => {
        _onLoad(false);
    })

    const _onLoad = (refresh = false) => {
        if (!refresh && isFinish) {
            return false;
        }
        const current = refresh ? 1 : page.current + 1;
        const pageSize = page.pageSize;
        onLoad({
            current,
            pageSize
        }).then(({ list, total }) => {
            setPage({
                current,
                pageSize,
                total
            })
            setIsFinish(current >= Math.ceil(total / pageSize));
            if (refresh) {
                setRecords(list);
            } else {
                setRecords(records.concat(list));
            }
            Taro.stopPullDownRefresh();
        }).catch(() => {
            Taro.stopPullDownRefresh();
        })
    }

    const empty = props.empty || <Empty/>;

    const children = props.children({ list: records }); // 以函数形式运行

    return (
        <View>
            {
                records.length > 0 ?
                children :
                empty
            }
        </View>
    )
}

