import React from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'

import styles from './index.module.less'
import logo from '../../../images/bg_kachaxionglogo@2x.png'
import service from '../../../images/lADPD26eM94wIlzNAa7NAa4_430_430.jpg'

export default () => {

    const downloadImgToAlbum = () => {
        Taro.saveImageToPhotosAlbum({
            filePath: service,
            success: () => {
                Taro.showToast({
                    title:'保存成功',
                    icon:'none',
                    duration:1000
                })
            }
        })
    }

    const longTap = (e) => {
        e.stopPropagation();
        Taro.getSetting({
            success (res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {//没有授权
                    Taro.authorize({
                        scope:'scope.writePhotosAlbum',
                        success: () => {
                            downloadImgToAlbum();
                        }
                    })
                } else { //已授权
                    downloadImgToAlbum();
                }
            }
        })
    }

    return (
        <View>
            <View className={styles["header"]}>
                <View onLongPress={longTap} className={styles["code-content"]}>
                    <Image className={styles["barcode"]} src={logo}/>
                    <View>
                        <View className={styles["title"]}>哇印人工客服</View>
                        <View className={styles["desc"]}>长按保存并扫码咨询</View>
                    </View>
                    <Image className={styles["service"]} src={service}/>
                </View>
            </View>
            <View className={styles["content"]}>
                <View className={styles["content-header"]}>常见问题</View>
                <View className={styles["content-body"]}>
                    <View className={styles["content-item"]}>
                        <View className={styles["title"]}>·订单如何取消或退款</View>
                        <View className={styles["desc"]}>如果下单发现有问题，但未付款可自行取消订单。如已付款，请添加上方客服，我们会查询下单商品是否在定制中，如还未定制，我们将人工给予退款</View>
                    </View>
                    <View className={styles["content-item"]}>
                        <View className={styles["title"]}>·什么情况下可以退/换货</View>
                        <View className={styles["desc"]}>若商品收到存在质量问题或者与下单不符的话，请添加上方客服，我们将为您处理（客服在线时间：9:00-18:00）</View>
                    </View>
                    <View className={styles["content-item"]}>
                        <View className={styles["title"]}>·什么情况下不能退款</View>
                        <View className={styles["desc"]}>确认已收到的商品，非质量问题无法退货退款哦～如已在定制中，将无法为您退款，还请谅解！</View>
                    </View>
                    <View className={styles["content-item"]}>
                        <View className={styles["title"]}>·退款什么时候到账</View>
                        <View className={styles["desc"]}>您好，退款申请后，会在1-3个工作日（节假日会延期）内原路返还到您的支付账户，您到时候可以留意下账单～</View>
                    </View>
                    <View className={styles["content-item"]}>
                        <View className={styles["title"]}>·免费为何还要付费</View>
                        <View className={styles["desc"]}>免费活动商品不变的，可是运费还需您自己承担哦，具体运费根据收货地址会有所不同</View>
                    </View>
                </View>
            </View>
        </View>
    )
}
