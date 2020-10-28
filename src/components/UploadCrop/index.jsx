import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';

import './index.less';
import Upload from '../Upload';
import CropImg from '../../components/CropImg';
import uploiadPlus from '../../../images/upload-plus@2x.png';
import { computeCropUrl, initImg } from '../../utils/utils'
import { EDIT_WIDTH } from '../../utils/picContent'

const getImageInfo = async (filePath) => {
    return new Promise((resolve) => {
        Taro.getImageInfo({
            src: filePath,
            success: (imgres) => {
                resolve(imgres);
            }
        })
    })
}

export default (props) => {

    const { width, height, onChange } = props;

    const [fileList, setFileList] = useState([]); 

    const onUploadChange = async (fileList) => {
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (!file.cropInfo) {
                const imgres = await getImageInfo(file.filePath);
                const proportion = width / height;
                const imgInfo = initImg({
                    ...imgres,
                    origin: [0.5, 0.5],
                    scale: 1,
                    translate: [0, 0]
                }, { width: EDIT_WIDTH, height: EDIT_WIDTH / proportion })
                file.cropInfo = {
                    originPath: file.filePath,
                    originImage: file.response.data,
                    cropImage: computeCropUrl(file.response.data, { ...imgInfo, contentWidth: EDIT_WIDTH, contentHeight: EDIT_WIDTH / proportion }),
                    printNums: 1,
                    imgInfo: imgInfo
                }
            }
        }
        setFileList(fileList);
        onChange(fileList);
    }

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
                    <CropImg className="item-img" width={width} height={height} cropOption={currentImg.cropInfo.imgInfo} src={currentImg.cropInfo.originPath}/>
                </View>
            }
            <Upload fileList={fileList} onChange={onUploadChange}>
                {
                    fileList.length >= 1 ? null : uploadBtn
                }
            </Upload>
        </View>
    )
}
