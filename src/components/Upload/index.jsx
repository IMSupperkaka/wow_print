import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import Taro from '@tarojs/taro';
import lodash from 'lodash';
import { View } from '@tarojs/components';

import './index.less';
import Dialog from '../Dialog';
import compressImg from '../../utils/compress/index';
import { setCache } from '../../hooks/useCacheImage';
import useFreshState from '../../hooks/useFreshState';
import { uploadFile } from '../../services/upload';

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

const uploadSync = async (file) =>{
    const imgInfo = await getImageInfo(file.filePath);
    const filePath = await compressImg({
        canvasId: 'compress-canvas',
        filePath: file.filePath,
        width: imgInfo.width,
        height: imgInfo.height
    });
    const newImgInfo = await getImageInfo(filePath);
    const response = await uploadFile({
        filePath: filePath
    })
    const thumbnail = `${response.data}?imageMogr2/auto-orient/format/jpg/thumbnail/!540x540r/quality/80!/interlace/1/ignore-error/1`
    const thumbnailPath = await new Promise((resolve) => {
        Taro.downloadFile({
            url: thumbnail,
            success: ({ tempFilePath }) => {
                resolve(tempFilePath);
            }
        })
    })
    setCache(thumbnail, thumbnailPath);
    return {
        file: {
            ...file,
            filePath: thumbnail
        },
        imgInfo: newImgInfo,
        response: response
    };
}

export default React.forwardRef((props, ref) => {

    const { defaultFileList = [], fileList, beforeUpload, limit = 1, onChange: onChangeProp } = props;

    const [uploadDialogProps, setUploadDialogProps] = useState({
        visible: false,
        totalCount: 0,
        doneCount: 0
    });

    const [getFileList, setFileList] = useFreshState(
        fileList || defaultFileList || [],
        fileList
    );

    useImperativeHandle(ref, () => {
        return {
            handleChoose
        }
    })

    const onChange = (info) => {
        setFileList(info.fileList);
        onChangeProp(info.file, info.fileList, info.params);
    }

    const progress = (item, res, imgInfo, status) => {
        const nextFileList = getFileList().concat();
        const index = nextFileList.findIndex((v) => {
            return v.uid == item.uid;
        });
        const currentItem = nextFileList[index];
        currentItem.status = status;
        currentItem.originImage = res?.data;
        currentItem.imgInfo = imgInfo;
        currentItem.cropInfo = {
            translate: [0, 0],
            scale: 1,
            ignoreBlur: false,
            rotate: 0,
            mirror: false
        }
        currentItem.filePath = item.filePath;
        onChange({
            file: currentItem,
            fileList: nextFileList
        });
    }

    const handleChoose = (params) => {
        if (typeof beforeUpload == 'function') {
            const result = beforeUpload();
            if (result === false) {
                return false;
            }
        }
        Taro.chooseImage({
            sizeType: ['original'],
            count: limit,
            success: (e) => {
                const nextFileList = getFileList().concat();
                setUploadDialogProps({
                    visible: true,
                    totalCount: e.tempFiles.length,
                    doneCount: 0
                })
                const uploadList = e.tempFiles.map((v, index) => {
                    return {
                        uid: lodash.uniqueId(new Date().getTime()),
                        filePath: v.path,
                        size: v.size,
                        status: 'before-upload'
                    }
                })
                if (params?.type == 'replace') {
                    let cloneNextFileList = JSON.parse(JSON.stringify(nextFileList));
                    cloneNextFileList.splice(params.index, 1, ...uploadList);
                    setFileList(cloneNextFileList);
                } else {
                    setFileList([
                        ...nextFileList,
                        ...uploadList
                    ]);
                }
                setTimeout(async () => {
                    for (let i = 0; i < uploadList.length; i++) {
                        progress(uploadList[i], null, null, 'uploading');
                        try {
                            const { file, imgInfo, response } = await uploadSync(uploadList[i]);
                            progress(file, response, imgInfo, 'done');
                        } catch (error) {
                            progress(uploadList[i], null, null, 'fail');
                        }
                        setUploadDialogProps((props) => {
                            return {
                                ...props,
                                doneCount: props.doneCount + 1
                            }
                        })
                    }
                    setUploadDialogProps((props) => {
                        return {
                            ...props,
                            visible: false
                        }
                    })
                }, 300)
            },
            fail: (err) => {
                console.log(err);
            }
        })
    }

    const chooseArea = props.children ? React.cloneElement(props.children, {
        onClick: handleChoose
    }) : null;

    return (
        <View className={props.className}>
            { chooseArea}
            <Dialog className="upload-dialog" title={`已上传${uploadDialogProps.doneCount}/${uploadDialogProps.totalCount}张`} visible={uploadDialogProps.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
        </View>
    )
});