import React, { useState, useEffect, useImperativeHandle } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

import './index.less';
import Dialog from '../Dialog'
import useFreshState from '../../hooks/useFreshState';
import { uploadFile } from '../../services/upload';

const getImageInfo = (filePath) => {
    return new Promise((resolve) => {
        Taro.getImageInfo({
            src: filePath,
            success: (imgres) => {
                resolve(imgres);
            }
        })
    })
}

export default React.forwardRef((props, ref) => {

    const { defaultFileList = [], fileList, beforeUpload, limit = 1, onChange: onChangeProp } = props;

    const [uploadList, setUploadList] = useState([]);

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
      onChangeProp(info.file, info.fileList);
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
            ignoreBlur: false
        }
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

    const handleChoose = () => {
        if (typeof beforeUpload == 'function') { // return false in beforeuUpload function to stop upload;
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
                const uploadList = e.tempFilePaths.map((v, index) => {
                    return {
                        uid: nextFileList.length + index,
                        filePath: v,
                        status: 'before-upload'
                    }
                })
                setUploadList(uploadList);
                setFileList([
                  ...nextFileList,
                  ...uploadList
                ]);
                uploadList.map((v) => {
                    progress(v, null, null, 'uploading');
                    uploadFile({
                        filePath: v.filePath
                    }).then((res) => {
                        getImageInfo(v.filePath).then((imgInfo) => {
                            progress(v, res, imgInfo, 'done');
                        })
                    })
                })
            }
        })
    }

    const chooseArea = props.children ? React.cloneElement(props.children, {
        onClick: handleChoose
    }) : null;


    const totalCount = uploadList.length;
    const uploadingCount = uploadList.filter((v) => { return v.status != 'done' }).length;
    const uploadDialogProps = {
      visible: uploadingCount > 0,
      totalCount: totalCount,
      doneCount: totalCount - uploadingCount
    }

    return (
        <View>
            { chooseArea }
            <Dialog className="upload-dialog" title={`已上传${uploadDialogProps.doneCount}/${uploadDialogProps.totalCount}张`} visible={uploadDialogProps.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
        </View>
    )
});
