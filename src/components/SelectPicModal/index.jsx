import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button, ScrollView } from '@tarojs/components';

import styles from './index.module.less';
import Modal from '../Modal';
import Upload from '../Upload';

export default (props) => {

    const { imgList = [], onChange, onReplace, limit = 1, ...resetProps } = props;

    const handleChange = (file, fileList) => {
        onChange({
            ...file,
            status: file.status || 'done'
        });
        resetProps.onClose();
    }

    const filterList = imgList.filter((v) => {
        return v?.originImage;
    })

    return (
        <Modal {...resetProps}>
            <View className={styles['select-title']}>已上传图片
                <View className={styles['close']} onClick={resetProps.onClose}>取消</View>
            </View>
            <ScrollView scrollY style={{ height: "60vh", background: "#F6F6F6" }}>
                <View className={styles['select-content']}>
                    {
                        filterList.map((item, index) => {
                            return (
                                <View className={styles['img-item']} onClick={() => { handleChange(item) }}>
                                    <Image className={styles['img']} mode="aspectFill" src={`${item.originImage}?imageView2/1/w/200/h/200`} />
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <Upload limit={limit} onChange={handleChange}>
                <View className={styles['upload-btn']}>从手机相册上传</View>
            </Upload>
        </Modal>
    )
}
