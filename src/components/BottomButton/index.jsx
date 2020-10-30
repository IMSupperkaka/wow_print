import React from 'react';
import { connect } from 'react-redux'
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import SafeArea from '../../components/SafeArea';
import Upload from '../../components/Upload';

import './index.less';

const BottomButton = (props) => {

    const {onSave, goPrint, onChange, limit, confirmOrder: { coupon, userImageList }} = props;

    const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + v.printNums }, 0);

    const handleGoPrint = () => {
        goPrint()
    };

    const handleSaveWorks = () => {
        onSave()
    };

    const handleChange = (fileList) => {
        onChange(fileList);
    };


    return (
        <SafeArea>
            {({ bottom }) => {
                const btmLine = userImageList.length ? 
                <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className="submit-wrap">
                    {
                        coupon.couponName &&
                        <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                    }
                    <View className="submit-left" onClick={handleSaveWorks}>存入作品集</View>
                    {
                        userImageList.length === limit ? <View className="submit-right" onClick={handleGoPrint}>
                            <Text>立即定制</Text>
                            <Text>(已上传{userImageList.length}张)</Text>
                        </View> : <View className="submit-right">
                            <Upload  limit={limit - userImageList.length} onChange={handleChange}>
                                <View>
                                    <Text className="batch">批量上传</Text>
                                    <Text className="need">(还需{limit - +userImageList.length}张)</Text>
                                </View>
                            </Upload>
                        </View>
                    }
                </View> : <Upload limit={limit - userImageList.length} onChange={handleChange}>
                    <View style={{ paddingBottom: Taro.pxTransform(bottom + 32, 750) }} className="submit-red">
                        <Text className="batch">批量上传</Text>
                        <Text className="need">(需上传{limit}张照片)</Text>
                    </View>
                </Upload>
                    
                return btmLine
            }}
        </SafeArea>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(BottomButton);
