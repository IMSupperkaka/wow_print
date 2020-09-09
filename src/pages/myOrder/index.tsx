import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import Tabs from '../../components/Tabs'
import Tab from '../../components/Tab'

export default (props) => {
    return (
      <View>
        <Tabs>
          <Tab title="全部">全部</Tab>
          <Tab title="待付款">待付款</Tab>
          <Tab title="待发货">待发货</Tab>
          <Tab title="待收货">待收货</Tab>
          <Tab title="已退款">已退款</Tab>
          <Tab title="已退款">已退款</Tab>
        </Tabs>
      </View>
    )
}
