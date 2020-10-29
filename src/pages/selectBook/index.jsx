import React, { useState } from 'react'
import { View, Image, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import lodash from 'lodash';

import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';

import './index.less'
import { SELECT_WIDTH } from '../../utils/picContent'
import { uploadFile } from '../../services/upload'
import { list } from '../../services/address'
import Dialog from '../../components/Dialog'
import SafeArea from '../../components/SafeArea'
import editIcon from '../../../images/icon_edit.png'
import addIcon from '../../../images/icon_add_gray.png'
import wayin from '../../../images/cover_wayin.png'
import { arg } from 'mathjs';

const SelectBook = ({ dispatch, confirmOrder }) => {

    const { coupon, userImageList, proportion } = confirmOrder;

    const [progress, setProgress] = useState({
        visible: false,
        totalNum: 0,
        completeNum: 0
    });

    const [visible, setVisible] = useState(false);

    const [twinsList, setTwinsList] = useState([
        [{},{}],
        [{},{}],
        [{},{}],
        [{},{}],
        [{},{}],
        [{},{}],
        [{},{}],
        [{},{}]
    ]);

    const beforeUpload = () => {
        if (userImageList.length > 0) {
            setVisible(true);
            return false;
        }
    };

    const onChange = (fileList) => {
        let curImgList = [
            ...userImageList,
            ...fileList
        ];

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: lodash.uniqBy(curImgList, 'uid')
        })
    };

    const handleChoose = () => {
        Taro.chooseImage({
            sizeType: ['original'],
            success: (e) => {
                setProgress({
                    ...progress,
                    visible: true,
                    totalNum: e.tempFilePaths.length,
                    completeNum: 0
                })
                e.tempFilePaths.map((v) => {
                    uploadFile({
                        filePath: v
                    }).then((res) => {
                        setProgress((progress) => {
                            const completeNum = progress.completeNum + 1;
                            return {
                                ...progress,
                                completeNum: completeNum,
                                visible: completeNum < e.tempFilePaths.length
                            }
                        })
                        dispatch({
                            type: 'confirmOrder/pushUserImg',
                            payload: {
                                filePath: v,
                                res: res
                            }
                        })
                    })
                })
            }
        })
    };

    const handleDelete = (index) => {
        Taro.showModal({
            title: '确定删除',
            content: '是否删除该照片',
            confirmText: '确定',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    let cloneList = [...userImageList];
                    cloneList.splice(index, 1);
                    dispatch({
                        type: 'confirmOrder/saveUserImageList',
                        payload: cloneList
                    })
                }
            }
        })
    };

    const handleOprate = (index, type) => {
        let cloneList = [...userImageList];
        let item = cloneList[index];
        if (item.printNums <= 1 && type == 'substract') {
            return;
        }
        cloneList.splice(index, 1, {
            ...item,
            printNums: type == 'substract' ? (item.printNums - 1) : (item.printNums + 1)
        });
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
    };

    const handleGoPrint = () => {
        if (userImageList.length <= 0) {
            return Taro.showToast({
                title: '至少选择一张照片',
                icon: 'none'
            })
        }
        list().then(({ data }) => {
            if (data.data.length <= 0) {
                Taro.navigateTo({
                    url: `/pages/addressEdit/index?type=add&redirect=${encodeURIComponent('/pages/confirmOrder/index')}`
                })
            } else {
                Taro.navigateTo({
                    url: '/pages/confirmOrder/index'
                })
            }
        })
    };

    const handleGoEdit = (index) => {
        dispatch({
            type: 'confirmOrder/saveActiveIndex',
            payload: index
        })
        Taro.navigateTo({
            url: '/pages/imgEdit/index'
        })
    };

    const handleSaveWorks = () => {
        /**
         * 保存作品集的操作
         * 从作品集入口进来的时候，点击存入作品集要提示，将会覆盖，是否确认保存。
         */
        Taro.showModal({
            title: '确认保存',
            content: '将覆盖原作品，是否确认保存当前修改？',
            confirmText: '确认',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    del(query.id).then(() => {
                        Taro.navigateBack();
                    })
                }
            }
        })
        // Taro.showToast({
        //     title:'已保存，可在作品集中查看',
        //     icon: 'none',
        //     duration: 1000
        // })
        // Taro.showToast({
        //     title:'作品集已满，请清除过多的作品',
        //     icon: 'none',
        //     duration: 1000
        // })
    };

    const handleEditInfo = (isShow) => {

    };

    const restFreeNums = (coupon.couponFreeNums || 0) - userImageList.reduce((count, v) => { return count + v.printNums }, 0);

    const contentStyle = {
      height: `${Taro.pxTransform(SELECT_WIDTH / proportion)}`
    };

    return (
        <View className="index">
            <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
            <View className="content">
                <View className="item-box">
                    <View className="cover">
                        <View className="cover-top">
                            <View className="edit-box">
                                <View className="title-box">
                                    <Text className="title">定格真我 触手可及</Text>
                                    <Image src={editIcon} className="edit-icon" onClick={() => handleEditInfo(true)}/>
                                </View>
                                <View className="description">
                                    To 哇印定制
                                </View>
                            </View>
                            <Image src={wayin} mode="aspectFit" className="wayin"/>
                        </View>
                        <UploadCrop beforeUpload={beforeUpload} fileList={userImageList[0] ? [userImageList[0]] : []} onChange={onChange} className="cover-con" width={555} height={472}/>
                    </View>
                    <View className="page-num">封面</View>
                </View>
                {
                    twinsList.map((item, index) => {
                        const fileList = [];
                        userImageList[((index+1)*2)-1] && (fileList.push(userImageList[((index+1)*2)-1]));
                        userImageList[((index+1)*2)] && (fileList.push(userImageList[((index+1)*2)]));
                        return (
                            <View className="twins-item item-box" key={index}>
                                <View className="item-body">
                                    {
                                        item.map((child, i) => {
                                            const file = fileList[i] ? [fileList[i]] : [];
                                            return (
                                                <View className="choose-item" key={i}>
                                                    <UploadCrop beforeUpload={beforeUpload} fileList={file} onChange={onChange} className="cover-con" width={320} height={320}/>
                                                    <View className={`mask-box ${i % 2 ? 'right' : 'left'}`}>
                                                        <View className="mask-bottom black">
                                                            <View className="btn">调整</View>
                                                            <View className="line" />
                                                            <View className="btn">换图</View>
                                                        </View>
                                                        {/* <View className="mask-tips">
                                                            <Text>提示</Text>
                                                            <Text>图片模糊或过长哦~</Text>
                                                        </View> */}
                                                        <View className="mask-bottom">
                                                            <View className="btn">忽略</View>
                                                            <View className="line" />
                                                            <View className="btn">换图</View>
                                                        </View>
                                                    </View>
                                                </View>
                                            )
                                        }) 
                                    }
                                </View>
                                <View className="page-num">{`${++index*2 - 1} - ${index*2}`}</View>
                            </View>
                        )
                    })
                }
            </View>
            <SafeArea>
                {({ bottom }) => {
                    const btmLine = userImageList.length ? 
                    <View style={{ paddingBottom: Taro.pxTransform(bottom + 20, 750) }} className="submit-wrap">
                        {
                            coupon.couponName &&
                            <View className="freenums-tag">还可免费打印{restFreeNums < 0 ? 0 : restFreeNums}张</View>
                        }
                        <View className="submit-left" onClick={handleSaveWorks}>存入作品集</View>
                        {
                            userImageList.length === 17 ? <View className="submit-right" onClick={handleGoPrint}>
                                <Text>立即定制</Text>
                                <Text>(已上传{userImageList.length}张)</Text>
                            </View> : <View className="submit-right">
                                <Text onClick={handleChoose}>批量上传</Text>
                                <Text>(还需{17 - +userImageList.length}张)</Text>
                            </View>
                        }
                    </View> :
                    <View style={{ paddingBottom: Taro.pxTransform(bottom + 32, 750) }} className="submit-red" onClick={handleChoose}>
                        <Text className="batch">批量上传</Text>
                        <Text className="need">(需上传17张照片)</Text>
                    </View>
                    return btmLine
                }}
            </SafeArea>
            <Dialog className="upload-dialog" title={`已上传${progress.completeNum}/${progress.totalNum}张`} visible={progress.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
            <SelectPicModal onChange={onChange} imgList={lodash.uniqBy(userImageList, 'filePath')} visible={visible} onClose={() => { setVisible(false) }}/>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectBook);
