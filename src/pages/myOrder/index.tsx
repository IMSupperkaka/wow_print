import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'

import Tabs from '../../components/Tabs'
import TabPanel from '../../components/TabPanel'
import OrderList from './OrderList'

export default (props) => {

    const [current, setCurrent] = useState(0);

    const onChange = (e) => {
        setCurrent(e.detail.current);
    }

    return (
        <View>
            <Tabs onChange={onChange}>
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
            </Tabs>
        </View>
    )
}
