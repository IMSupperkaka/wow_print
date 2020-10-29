import React, { useState, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { app } from '../../dva';

import './index.less';
import Upload from '../Upload';
import CropImg from '../../components/CropImg';
import uploiadPlus from '../../../images/upload-plus@2x.png';

export default (props) => {

    const { width, height, onChange, beforeUpload, limit = 1, fileList = [] } = props;

    const upload = useRef();

    const onUploadChange = async (fileList) => {
        onChange(fileList);
    };

    const currentImg = fileList[0];
    
    const uploadBtn = (
        <View className="upload-area" style={{ width: Taro.pxTransform(width), height: Taro.pxTransform(height) }}>
            <Image src={uploiadPlus}/>
        </View>
    );

    const onHandleEdit = () => {
        app.dispatch({
            type: 'editimg/goEditImg',
            payload: {
                imgList: [
                    {
                        ...currentImg,
                        proportion: width / height
                    }
                ],
                defaultIndex: 0
            }
        })
    }

    return (
        <View className={props.className}>
            {
                currentImg &&
                <View className="crop-img-wrap">
                    <CropImg onHandleEdit={onHandleEdit} onHandleChange={() => { upload.current.handleChoose(); }} className="item-img" width={width} height={height} imgInfo={currentImg.imgInfo} cropOption={currentImg.cropInfo} src={currentImg.filePath}/>
                </View>
            }
            <Upload limit={limit} ref={upload} fileList={fileList} onChange={onUploadChange} beforeUpload={beforeUpload}>
                {
                    fileList.length >= 1 ? null : uploadBtn
                }
            </Upload>
        </View>
    )
}
