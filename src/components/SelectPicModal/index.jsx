import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button, ScrollView } from '@tarojs/components';

import styles from './index.module.less';
import Modal from '../Modal';
import Upload from '../Upload';
import { thumbnail } from '@/hooks/useThumbnail';

export default (props) => {

    const { imgList = [], onChange, onReplace, limit = 1, onClose, ...resetProps } = props;

    const handleChange = (file, fileList) => {
        if (file.status == 'done') {
            onChange({
                ...file,
                cropInfo: {
                    translate: [0, 0],
                    scale: 1,
                    ignoreBlur: false,
                    rotate: 0,
                    mirror: false
                },
                status: file.status || 'done'
            });
        }
        if (fileList) {
            const uploadingList = fileList.filter((v) => {
                return v.status != 'done'
            })
            if (uploadingList.length <= 0) {
                setTimeout(() => {
                    onClose();
                }, 300)
            }
        }
    }
    const filterList = imgList.filter((v) => {
        return v?.originImage;
    })

    return (
        <Modal {...resetProps} onClose={onClose}>
            <View className={styles['select-title']}>已上传图片
                <View className={styles['close']} onClick={onClose}>取消</View>
            </View>
            <ScrollView scrollY style={{ height: "60vh", background: "#F6F6F6" }}>
                <View className={styles['select-content']}>
                    {
                        filterList.map((item, index) => {
                            return (
                                <View className={styles['img-item']} onClick={() => {
                                    onClose();
                                    handleChange({
                                        ...item,
                                        status: 'done'
                                    });
                                }}>
                                    <Image className={styles['img']} mode="aspectFill" src={thumbnail(item.originImage)} />
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
