import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import Taro from '@tarojs/taro';
import { View, Canvas } from '@tarojs/components';

import './index.less';
import Dialog from '../Dialog';
import { compressImg } from '../../utils/compress';
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

    const compressRef = useRef();

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

    const handleChoose = () => {
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
                    getImageInfo(v.filePath).then((imgInfo) => {
                      uploadFile({
                          filePath: v.filePath
                      }).then((res) => {
                          compressImg({ filePath: v.filePath, width: imgInfo.width, height: imgInfo.height }).then((filePath) => {
                            progress({
                              ...v,
                              filePath
                            }, res, imgInfo, 'done');
                          });
                      })
                    })
                })
            }
        })
    }

    const compressImg = ({ filePath, width, height }) => {
      return new Promise((resolve, reject) => {
        const context = Taro.createCanvasContext('compress-canvas');
        const drawWidth = width > height ? 500 : 500 * (width / height);
        const drawHeight = width > height ? (500 / (width / height)) : 500;
        context.drawImage(filePath, 0, 0, drawWidth, drawHeight)
        context.draw(false, () => {
          Taro.canvasToTempFilePath({
            canvasId: "compress-canvas",
            width: drawWidth,
            height: drawHeight,
            fileType: "jpg",
            quality: 1,
            success: ({ tempFilePath }) => {
              resolve(tempFilePath);
            },
            complete: (result) => {
              console.log(result);
            }
          });
        })
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
        <View className={props.className}>
            { chooseArea }
            <Dialog className="upload-dialog" title={`已上传${uploadDialogProps.doneCount}/${uploadDialogProps.totalCount}张`} visible={uploadDialogProps.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
            <Canvas style={{ width: 500, height: 500, position: 'absolute', left: 9999, top: 9999 }} ref={compressRef} canvasId="compress-canvas"/>
        </View>
    )
});
