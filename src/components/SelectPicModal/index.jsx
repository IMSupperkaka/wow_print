import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button, ScrollView } from '@tarojs/components';

import './index.less';
import Modal from '../Modal';
import Upload from '../Upload';

export default (props) => {

    const { imgList = [], onChange, onReplace, count, ...resetProps } = props;

    const handleChange = (fileList) => {
        onChange(fileList);
        // resetProps.onClose();
    }

    const handleReplace = (fileList, index) => {
        onReplace(fileList, index)
    }

    return (
        <Modal {...resetProps}>
            <View className="select-title">已上传图片
                <View className="close" onClick={resetProps.onClose}>取消</View>
            </View>
            <ScrollView scrollY style={{height: "60vh", background: "#F6F6F6"}}>
                <View className="select-content">
                    {
                        imgList.map((item, index) => {
                            return (
                                <Upload onChange={(fileList) => {handleReplace(fileList, index)}} key={index}>
                                    <View className="img-item">
                                        <Image mode="aspectFill" src={item.filePath}/>
                                    </View>
                                </Upload>
                            )
                        })
                    }
                </View>
            </ScrollView>
            {
                imgList.length < 17 && 
                <Upload limit={17 - imgList.length} onChange={handleChange}>
                    <View class="upload-btn">从手机相册上传</View>
                </Upload>
            }
        </Modal>
    )
}
