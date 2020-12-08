import { useReachBottom } from '@tarojs/taro';
import React, { useState, useEffect } from 'react';

export default (props) => {

    const { onLoad } = props;

    const [finish, setFinish] = useState(false);

    const [loading, setLoading] = useState(false);

    const [records, setRecords] = useState([]);

    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    const getData = (refresh) => {
        if (finish || loading) {
            return false;
        }
        setLoading(true);
        onLoad({
            ...page,
            current: refresh ? 1 : (page.current + 1)
        }).then(({ total, current, list }) => {
            setPage((page) => {
                return {
                    ...page,
                    total,
                    current
                }
            })
            setRecords((records) => {
                let newRecords = records.concat(list);
                if (refresh) {
                    newRecords = list;
                }
                if (newRecords.length >= total) {
                    setFinish(true);
                }
                return newRecords;
            });
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        })
    }

    const reachBottom = (e) => {
        if (location.pathname === location.pathname) {
            if ((e.target.clientHeight + e.target.scrollTop + 40) >= e.target.scrollHeight) {
                getData(false);
            }
        }
    }

    useEffect(() => {
        if (process.env.TARO_ENV === 'h5') {
            document.querySelector('.taro-tabbar__panel').addEventListener('scroll', reachBottom)
            return () => {
                document.querySelector('.taro-tabbar__panel').removeEventListener('scroll', reachBottom)
            }
        }
    }, [page, loading, finish])

    useEffect(() => {
        getData(true);
    }, [])

    useReachBottom(() => {
        getData(false);
    })

    return {
        finish,
        loading,
        records,
        refresh: () => {
            getData(true);
        }
    }

}