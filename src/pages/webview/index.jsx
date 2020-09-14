import React from 'react'
import Taro, { Component } from '@tarojs/taro'
import { View, WebView } from '@tarojs/components'

export default () => {

    const query = Taro.getCurrentInstance().router.params;

    return (
        <WebView src={query.url}/>
    )
}