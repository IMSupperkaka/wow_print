import React, { useState, useRef, useImperativeHandle } from 'react';
import Taro from '@tarojs/taro';
import lodash from 'lodash';
import { View } from '@tarojs/components';

import './index.less';
import Dialog from '../Dialog';
import useNewId from '../../hooks/useNewId';
import compressImg from '../../utils/compress/index';
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

const uploadSync = async (file, canvasId) =>{
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
    return {
        file: {
            ...file,
            filePath: thumbnail,
        },
        imgInfo: newImgInfo,
        response: response
    };
}

export default React.forwardRef((props, ref) => {

    const { defaultFileList = [], fileList, beforeUpload, limit = 1, onChange: onChangeProp } = props;

    const [uploadList, setUploadList] = useState([]);

    const [getFileList, setFileList] = useFreshState(
        fileList || defaultFileList || [],
        fileList
    );

    const { id: canvasId } = useNewId('compress-canvas-');

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
        setUploadList((uploadList) => {
            const cloneUploadList = [...uploadList];
            const uploadIndex = cloneUploadList.findIndex((v) => {
                return v.uid == item.uid;
            });
            cloneUploadList[uploadIndex] = currentItem;
            return cloneUploadList;
        });
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
                const uploadList = e.tempFiles.map((v, index) => {
                    return {
                        uid: lodash.uniqueId(new Date().getTime()),
                        filePath: v.path,
                        size: v.size,
                        status: 'before-upload'
                    }
                })
                setUploadList(uploadList);
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
                            const { file, imgInfo, response } = await uploadSync(uploadList[i], canvasId);
                            progress(file, response, imgInfo, 'done');
                        } catch (error) {
                            progress(uploadList[i], null, null, 'fail');
                        }
                    }
                }, 0)
            },
            fail: (err) => {
                console.log(err);
            }
        })
    }

    const chooseArea = props.children ? React.cloneElement(props.children, {
        onClick: handleChoose
    }) : null;

    const totalCount = uploadList.length;
    const uploadingCount = uploadList.filter((v) => { return (v.status != 'done' && v.status != 'fail') }).length;
    const uploadDialogProps = {
        visible: uploadingCount > 0,
        totalCount: totalCount,
        doneCount: totalCount - uploadingCount
    }

    return (
        <View className={props.className}>
            { chooseArea}
            <Dialog className="upload-dialog" title={`已上传${uploadDialogProps.doneCount}/${uploadDialogProps.totalCount}张`} visible={uploadDialogProps.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
        </View>
    )
});;