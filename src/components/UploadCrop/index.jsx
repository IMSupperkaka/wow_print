import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';

import './index.less';
import Upload from '../Upload';
import CropImg from '../../components/CropImg';
import uploiadPlus from '../../../images/upload-plus@2x.png';

export default (props) => {

    const { width, height, onChange, beforeUpload, fileList = [] } = props;

    const onUploadChange = async (fileList) => {
        onChange(fileList);
    };

    const currentImg = fileList[0];
    
    const uploadBtn = (
        <View className="upload-area" style={{ width: Taro.pxTransform(width), height: Taro.pxTransform(height) }}>
            <Image src={uploiadPlus}/>
        </View>
    );

    return (
        <View className={props.className}>
            {
                fileList.length >= 1 &&
                <View className="crop-img-wrap">
                    <CropImg className="item-img" width={width} height={height} cropOption={currentImg.cropInfo} src={currentImg.filePath}/>
                </View>
            }
            <Upload fileList={fileList} onChange={onUploadChange} beforeUpload={beforeUpload}>
                {
                    fileList.length >= 1 ? null : uploadBtn
                }
            </Upload>
        </View>
    )
}
