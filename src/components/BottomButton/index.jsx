import React from 'react';
import { connect } from 'react-redux'
import Taro from '@tarojs/taro';
import { View, Button, Text } from '@tarojs/components';
import SafeArea from '@/components/SafeArea';
import Upload from '@/components/Upload';

// TODO: 移除全局样式
import './index.less';

// TODO: 公用组件不应以redux中的数据为驱动
const BottomButton = (props) => {

    const {onSave, goPrint, onChange, limit, confirmOrder: { coupon, userImageList }} = props;

    const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + (v?.printNums || 0) }, 0);

    const notEmptyImageCount = userImageList.filter((v) => { return !!v }).length;

    return (
        <SafeArea>
            {({ bottom }) => {
                return (
                    <>
                        <View style={{ visibility: notEmptyImageCount > 0 ? "visible" : "hidden", paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className="wy-submit-wrap">
                            {
                                (coupon.couponName && coupon.couponMethod == 1) &&
                                <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                            }
                            <Button onClick={onSave} className="radius-btn outline-btn submit-left">存入作品集</Button>
                            {
                                notEmptyImageCount >= limit ?
                                <View className="submit-right" onClick={goPrint}>
                                    <Text>立即定制</Text>
                                </View> :
                                <View className="submit-right">
                                    <Upload limit={limit -notEmptyImageCount} onChange={onChange}>
                                        <View>
                                            <Text className="batch">批量上传</Text>
                                            <Text className="need">(还需{limit - notEmptyImageCount}张)</Text>
                                        </View>
                                    </Upload>
                                </View>
                            }
                        </View>
                        <Upload style={{ visibility: notEmptyImageCount > 0 ? "hidden" : "visible", }} limit={limit - notEmptyImageCount} onChange={onChange}>
                            <View style={{ paddingBottom: Taro.pxTransform(bottom + 32, 750) }} className="wy-submit-red">
                                <Text className="batch">批量上传</Text>
                                <Text className="need">(需上传{limit}张照片)</Text>
                            </View>
                        </Upload>
                    </>
                )
            }}
        </SafeArea>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(BottomButton);
