import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import React, { useEffect, useReducer, useRef } from 'react';

export default (props) => {

    const { onLoad, pullDownRefresh, pageSize = 10 } = props;

    const stateRef = useRef();

    const listReducer = (state, action) => {
        switch (action.type) {
            case 'save':
                const newState = {
                    ...state,
                    ...action.payload
                };
                stateRef.current = newState;
                return newState;
        }
    }

    const [state, dispatch] = useReducer(listReducer, {
        finish: false,
        loading: false,
        records: [],
        page: {
            current: 0,
            pageSize: pageSize,
            total: 0
        }
    })

    stateRef.current = state;

    const getData = (refresh) => {

        const { finish, loading, records, page } = stateRef.current;

        if ((finish && !refresh) || loading) {
            return false;
        }
        dispatch({
            type: 'save',
            payload: {
                loading: true
            }
        })
        console.log(stateRef.current)
        // setLoading(true);
        onLoad({
            ...page,
            current: refresh ? 1 : (page.current + 1)
        }).then(({ total, current, list }) => {
            let newRecords = records.concat(list);
            if (refresh) {
                newRecords = list;
            }
            dispatch({
                type: 'save',
                payload: {
                    page: {
                        ...page,
                        total,
                        current
                    },
                    finish: newRecords.length >= total ? true : false,
                    loading: false,
                    records: newRecords
                }
            })
            if (pullDownRefresh) {
                Taro.stopPullDownRefresh();
            }
        }).catch(() => {
            if (pullDownRefresh) {
                Taro.stopPullDownRefresh();
            }
            dispatch({
                type: 'svae',
                payload: {
                    loading: false
                }
            })
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
    }, [])

    useEffect(() => {
        getData(true);
    }, [])

    usePullDownRefresh(() => {
        if (pullDownRefresh) {
            getData(true);
        }
    })

    useReachBottom(() => {
        getData(false);
    })

    return {
        ...state,
        refresh: () => {
            getData(true);
        }
    }

}