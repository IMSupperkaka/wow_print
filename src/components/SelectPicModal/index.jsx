import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button, ScrollView } from '@tarojs/components';

import './index.less';
import Modal from '../Modal';
import Upload from '../Upload';

export default (props) => {

    const { imgList = [], onChange, onReplace, limit = 1, ...resetProps } = props;

    const handleChange = (file, fileList) => {
        onChange({
          ...file,
          cropInfo: {
              ...file.cropInfo,
              translate: [0, 0],
              scale: 1,
              ignoreBlur: false
          },
          status: 'done'
        });
        resetProps.onClose();
    }

    const filterList = imgList.filter((v) => {
      return v?.originImage;
    })

    return (
        <Modal {...resetProps}>
            <View className="select-title">已上传图片
                <View className="close" onClick={resetProps.onClose}>取消</View>
            </View>
            <ScrollView scrollY style={{height: "60vh", background: "#F6F6F6"}}>
                <View className="select-content">
                    {
                        filterList.map((item, index) => {
                            return (
                                <View className="img-item" onClick={() => { handleChange(item) }}>
                                    <Image mode="aspectFill" src={`${item.originImage}?imageView2/1/w/200/h/200`}/>
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <Upload limit={limit} onChange={handleChange}>
              <View class="upload-btn">从手机相册上传</View>
            </Upload>
        </Modal>
    )
}
