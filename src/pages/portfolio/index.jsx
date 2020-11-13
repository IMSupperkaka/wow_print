import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { connect } from 'react-redux';
import { View, Image, Button } from '@tarojs/components';
import { AtSwipeAction } from "taro-ui";

import './index.less';
import { list as getList, detail, deleteWork } from '../../services/portfolio';
import Empty from '../../components/Empty';
import List from '../../components/List';

const Portfolio = ({ dispatch }) => {

    const [page, setPage] = useState({
        current: 0,
        pageSize: 10,
        total: 0
    });

    const [isFinish, setIsFinish] = useState(false);

    const [list, setList] = useState([]);

    const getData = (refresh = false) => {

        const current = refresh ? 1 : page.current + 1;
        const pageSize = page.pageSize;

        return getList({
            pageNum: current,
            pageSize: pageSize
        }).then(({ data }) => {
            setPage({
                current,
                pageSize,
                total: data.data.total
            })
            if (refresh) {
                setList(data.data.records)
            } else {
                setList((list) => {
                    return list.concat(data.data.records)
                })
            }
            setIsFinish(current >= Math.ceil(data.data.total / pageSize));
        })
    }

    const handleGoDetail = (item) => {
        detail({
            portfolioId: item.id
        }).then(({ data }) => {
            dispatch({
                type: 'confirmOrder/pushSeletPage',
                payload: {
                    goConfirmOrder: item.finishPage == item.totalPage,
                    goodInfo: data.data.goodsDetail,
                    portfolioId: item.id,
                    userImageList: data.data.imageList
                }
            })
        })
    }

    const handleDelete = (item) => {
        Taro.showModal({
            title: '确认删除',
            content: '确认将会删除该作品集以及包含的所有照片',
            confirmText: '确认',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    deleteWork(item.id).then(() => {
                        const cloneList = [...list];
                        const index = cloneList.findIndex((v) => { return v.id == item.id });
                        cloneList.splice(index, 1);
                        setList(cloneList);
                    })
                }
            }
        })
    }

    return (
        <View className="portfolio-list">
            <List onLoad={getData} isFinish={isFinish} empty={<Empty text="暂无作品哦"/>}>
                {
                    list.map((item) => {
                        return (
                            <AtSwipeAction onClick={handleDelete} className="portfolio-item-swipe" options={[
                                {
                                    id: item.id,
                                    text: '删除',
                                    style: {
                                        backgroundColor: '#FF4949'
                                    }
                                }
                                ]}>
                                <View className="portfolio-item" onClick={(e) => { handleGoDetail(item, e) }}>
                                    <View className="portfolio-left">
                                        <View className="portfolio-img-wrap">
                                            <Image class="portfolio-img" src={item.indexImage}/>
                                        </View>
                                        <View className="portfolio-info">
                                            <View>
                                                <View className="portfolio-title">
                                                    { item.name }
                                                    {
                                                        item.coupon &&
                                                        <View className="coupon-sign">优惠券</View>
                                                    }
                                                </View>
                                                <View className="portfolio-page">完成页码: { item.finishPage } / { item.totalPage }</View>
                                            </View>
                                            <View className="portfolio-time">创作时间: { item.updateTime.split(' ')[0] }</View>
                                        </View>
                                    </View>
                                    <Button className="radius-btn primary-outline-btn">
                                        {
                                            item.finishPage < item.totalPage ?
                                            '继续创作' :
                                            '购买'
                                        }
                                    </Button>
                                </View>
                            </AtSwipeAction>
                        )
                    })
                }
            </List>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(Portfolio);