import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button } from '@tarojs/components';

import './index.less';
import Modal from '../Modal';
import Upload from '../Upload';

export default (props) => {

    const { imgList = [], onChange, ...resetProps } = props;

    const handleChange = (fileList) => {
        onChange(fileList);
        resetProps.onClose();
    }

    const handleChoose = (item) => {
        handleChange([
            {
                ...item,
                uid: new Date().getTime()
            }
        ]);
    }

    return (
        <Modal {...resetProps} title="已上传图片">
            <View className="select-content">
                {
                    imgList.map((item) => {
                        return (
                            <View className="img-item" onClick={() => { handleChoose(item) }}>
                                <Image mode="aspectFill" src={item.filePath}/>
                            </View>
                        )
                    })
                }
            </View>
            <Upload onChange={handleChange}>
                <View class="upload-btn">从手机相册上传</View>
            </Upload>
        </Modal>
    )
}
