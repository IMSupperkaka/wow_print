import React, { useState, useEffect, useImperativeHandle } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

import { uploadFile } from '../../services/upload';

export default React.forwardRef((props, ref) => {

    const { defaultFileList = [], fileList, beforeUpload, onChange } = props;

    const [privateFileList, setPrivateFileList] = useState(fileList || defaultFileList);

    useImperativeHandle(ref, () => {
        return {
            handleChoose
        }
    })

    useEffect(() => {
        if (privateFileList.length > 0) {
            onChange(privateFileList);
        }
    }, [privateFileList])

    const progress = (item, res, status) => {
        setPrivateFileList((list) => {
            const index = list.findIndex((v) => {
                return v.uid == item.uid;
            });
            const cloneList = [...list];
            const currentItem = cloneList[index];
            currentItem.status = status;
            currentItem.response = res;
            return cloneList;
        })
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
            success: (e) => {
                const uploadList = e.tempFilePaths.map((v, index) => {
                    return {
                        uid: privateFileList.length + index,
                        filePath: v,
                        status: 'before-upload'
                    }
                })
                setPrivateFileList((list) => {
                    return [
                        ...list,
                        ...uploadList
                    ]
                });
                uploadList.map((v) => {
                    uploadFile({
                        filePath: v.filePath
                    }).then((res) => {
                        progress(v, res, 'done');
                    })
                })
            }
        })
    }

    const chooseArea = props.children ? React.cloneElement(props.children, {
        onClick: handleChoose
    }) : null;

    return (
        <View>
            {
                chooseArea
            }
        </View>
    )
});