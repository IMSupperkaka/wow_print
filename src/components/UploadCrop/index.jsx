import React, { useState, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { app } from '../../dva';

import './index.less';
import Upload from '../Upload';
import CropImg from '@/components/CropImg';
import uploiadPlus from '@/images/upload-plus@2x.png';

export default React.memo((props) => {

    const { width, height, editFinish, limit = 1, showIndex = 0, fileList = [], showEdit = true, className, ...restProps } = props;

    const upload = useRef();

    const currentImg = fileList[showIndex];

    const uploadBtn = (
        <View className="upload-area" style={{ width: Taro.pxTransform(width, 750), height: Taro.pxTransform(height, 750) }}>
            <Image className="upload-image" src={uploiadPlus}/>
        </View>
    );

    const onHandleEdit = () => {
        Taro.eventCenter.off('editFinish');
        Taro.eventCenter.on('editFinish', (res) => {
            editFinish && editFinish(res);
        })
        app.dispatch({
            type: 'editimg/goEditImg',
            payload: {
                imgList: fileList.map((v) => {
                    return {
                        ...v,
                        proportion: width / height
                    }
                }),
                defaultIndex: showIndex
            }
        })
    }

    const handleIgnore = () => {
        const cloneList = [...fileList];
        cloneList[showIndex].cropInfo = {
            ...currentImg.cropInfo,
            ignoreBlur: true
        }
        editFinish && editFinish(cloneList);
    }

    return (
        <View className={className}>
            {
                currentImg &&
                <View className="crop-img-wrap">
                    <CropImg
                        onIgnore={handleIgnore}
                        showEdit={showEdit}
                        onHandleEdit={onHandleEdit}
                        onHandleChange={() => { upload.current.handleChoose(); }}
                        className="item-img"
                        contentWidth={width}
                        contentHeight={height}
                        width={currentImg.imgInfo.width}
                        height={currentImg.imgInfo.height}
                        cropOption={currentImg.cropInfo}
                        src={currentImg.filePath || currentImg.originImage}
                    />
                </View>
            }
            <Upload limit={limit} ref={upload} {...restProps}>
                {
                    currentImg ? null : uploadBtn
                }
            </Upload>
        </View>
    )
})
