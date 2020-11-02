import React, { useState, useEffect } from 'react'
import { View, Image, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import './index.less'
import lodash from 'lodash';

import synthesis from '../../utils/synthesis';
import { computeCropUrl } from '../../utils/utils';
import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';
import BottomButton from '../../components/BottomButton';
import Modal from '../../components/Modal';

import editIcon from '../../../images/icon_edit.png'
import wayin from '../../../images/cover_wayin.png'

// 除了封面之外的图片数组
const twinsList = [
    [{},{}],
    [{},{}],
    [{},{}],
    [{},{}],
    [{},{}],
    [{},{}],
    [{},{}],
    [{},{}]
];

const modelList = [
    {},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}
];

const SelectBook = ({ dispatch, confirmOrder }) => {

    const { userImageList, goodId, portfolioId } = confirmOrder;

    const [activeIndex, setActiveIndex] = useState(0);

    const [visible, setVisible] = useState(false);

    const [coverInfo, setCoverInfo] = useState({
        temporaryName: "定格真我 触手可及",
        temporaryDesc: "To 哇印定制",
        bookName: "定格真我 触手可及",
        description: "To 哇印定制",
    });

    const [editVisible, setEditVisible] = useState(false);

    const beforeUpload = (index) => {
        if (userImageList.length > 0) {
            setActiveIndex(index);
            setVisible(true);
            return false;
        }
    };

    const onChange = (file, fileList, index = activeIndex) => {
        if (file.status == 'done') {
            dispatch({
                type: 'confirmOrder/mutateUserImageList',
                payload: {
                    userImage: file,
                    index
                }
            })
        }
    };

    const editFinish = (index, res) => {

        const coverList = [
            ...userImageList
        ];

        coverList[index].cropInfo = res;

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: coverList
        })
    }

    // 请求前 处理图片列表
    const handleResultList = () => {
        const resultList = modelList.map((item, index) => {
            let img = userImageList[index] || null;
            const content = index == 0 ? { contentWidth: 555, contentHeight: 472 } : { contentWidth: 320, contentHeight: 320 };
            if (img) {

                const cropImage = computeCropUrl(img.originImage, { // 裁剪后地址
                    ...content,
                    ...img.imgInfo
                }, img.cropInfo)

                const resultItem = {
                    // filePath: img.filePath,
                    imgInfo: img.imgInfo, // 图片原始信息 { width, height, ...resetInfo }
                    cropInfo: img.cropInfo, // 裁剪信息
                    originImage: img.originImage, // 图片七牛地址
                    cropImage: cropImage,
                    printNums: 1,
                    restInfo: {
                        bookName: img.bookName ? img.bookName : null,
                        description: img.description ? img.description : null
                    }
                }

                return {
                    ...resultItem,
                    synthesisList: synthesis(index == 0 ? 'bookCover' : 'bookPage', {
                        ...resultItem,
                        bookName: img.bookName,
                        description: img.description
                    })
                }
            } else {
                return null
            }
        })
        console.log(resultList)
        return resultList
    }

    // 去下单
    const submit = () => {
        const resultList = handleResultList()
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList
            }
        })
    };

    // 修改封面信息
    const handleEditCover = () => {
        if(!coverInfo.bookName && !coverInfo.description) {
            Taro.showToast({
                title:'请输入封面信息',
                icon: 'none',
                duration: 1000
            })
            return
        }
        setCoverInfo({
            ...coverInfo,
            bookName: coverInfo.temporaryName,
            description: coverInfo.temporaryDesc,
        })
        setEditVisible(false)
    };

    // 绑定封面信息到图片数组
    const bindCoverInfoToImage = () => {
        userImageList[0].bookName = coverInfo.bookName;
        userImageList[0].description = coverInfo.description;
    };

    // 存入作品集
    const handleSaveWorks = () => {
        if(!userImageList.length) {
            Taro.showToast({
                title:'请上传照片',
                icon: 'none',
                duration: 1500
            })
            return
        }
        bindCoverInfoToImage()
        const resultList = handleResultList()
        dispatch({
            type: 'confirmOrder/savePortfolio',
            payload: {
              resultList
            }
        })
    };

    // 替换图片
    const handleReplace = (fileList, index) => {
        let cloneList = [...userImageList];
        cloneList.splice(index, 1, ...fileList);

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
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
                                    <Text className="title">{coverInfo.bookName}</Text>
                                    <Image src={editIcon} className="edit-icon" onClick={() => setEditVisible(true)}/>
                                </View>
                                <View className="description">
                                    {coverInfo.description}
                                </View>
                            </View>
                            <Image src={wayin} mode="aspectFit" className="wayin"/>
                        </View>
                        <UploadCrop beforeUpload={beforeUpload.bind(this, 0)} editFinish={editFinish.bind(this, 0)} fileList={userImageList[0] ? [userImageList[0]] : []} onChange={onChange} width={555} height={472} className="cover-con"/>
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
                                                    <UploadCrop editFinish={editFinish.bind(this, index)} beforeUpload={beforeUpload.bind(this, (index+1)*2 - +!i)} fileList={file} onChange={onChange} width={320} height={320}/>
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
            <BottomButton onChange={(file, fileList) => { onChange(file, fileList, -1) }} onSave={handleSaveWorks} goPrint={submit} limit={17}/>
            <SelectPicModal onChange={onChange} imgList={lodash.uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }}/>
            <Modal visible={editVisible} onClose={() => { setEditVisible(false) }}>
                <View className="modal-content">
                    <View className="input-content">
                        <View className="input-item">
                            <Text className="title">名称</Text>
                            <Input
                                name='name'
                                type='text'
                                maxLength={12}
                                placeholder='最多12个字'
                                adjustPosition
                                placeholderStyle="color: #C1C1C1"
                                value={coverInfo.temporaryName}
                                onInput={(event) => {
                                    setCoverInfo({
                                        ...coverInfo,
                                        temporaryName: event.detail.value
                                    })
                                    return event.detail.value
                                }}
                            />
                        </View>
                        <View className="input-item">
                            <Text className="title">昵称</Text>
                            <Input
                                name='name'
                                type='text'
                                maxLength={20}
                                placeholder='最多20个字'
                                adjustPosition
                                placeholderStyle="color: #C1C1C1"
                                value={coverInfo.temporaryDesc}
                                onInput={(event) => {
                                    setCoverInfo({
                                        ...coverInfo,
                                        temporaryDesc: event.detail.value
                                    })
                                    return event.detail.value
                                }}
                            />
                        </View>
                    </View>
                    <View className="operate-content">
                        <View className="left-btn" onClick={() => {setEditVisible(false)}}>取消</View>
                        <View className={`right-btn ${coverInfo.bookName || coverInfo.description ? 'clickable' : ''}`} onClick={handleEditCover}>确认</View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectBook);
