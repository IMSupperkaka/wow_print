import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { usePullDownRefresh } from '@tarojs/taro'
import { View } from '@tarojs/components'

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
            setIsFinish(current >= total % pageSize);
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

    return (
        <View>
            {
                records.length > 0 ?
                props.children :
                empty
            }
        </View>
    )
}

