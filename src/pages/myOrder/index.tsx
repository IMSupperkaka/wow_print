import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'

import Tabs from '@/components/Tabs'
import TabPanel from '@/components/TabPanel'
import OrderList from './OrderList'
import Base from '../../layout/Base'

export default Base((props) => {

    const [current, setCurrent] = useState(props.router.query?.current || 0);

    const onChange = (current) => {
        setCurrent(current);
    }

    return (
        <View>
            <Tabs current={current} onChange={onChange}>
                <TabPanel title="全部">
                    <OrderList active={current == 0}/>
                </TabPanel>
                <TabPanel title="待付款">
                    <OrderList active={current == 1} status={1}/>
                </TabPanel>
                <TabPanel title="待发货">
                    <OrderList active={current == 2} status={2}/>
                </TabPanel>
                <TabPanel title="待收货">
                    <OrderList active={current == 3} status={3}/>
                </TabPanel>
                <TabPanel title="已取消">
                    <OrderList active={current == 4} status={4}/>
                </TabPanel>
                <TabPanel title="已退款">
                    <OrderList active={current == 5} status={5}/>
                </TabPanel>
                <TabPanel title="已关闭">
                    <OrderList active={current == 6} status={6}/>
                </TabPanel>
            </Tabs>
        </View>
    )
})
