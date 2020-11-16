import React, { useState, useEffect, useRef } from 'react'
import { View, Image, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import day from 'dayjs'
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
    [{}, {}],
    [{}, {}],
    [{}, {}],
    [{}, {}],
    [{}, {}],
    [{}, {}],
    [{}, {}],
    [{}, {}]
];

const modelList = [
    {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
];

const SelectBook = ({ dispatch, confirmOrder }) => {

    console.log('render-view');

    const { userImageList, goodId, portfolioId } = confirmOrder;

    const [activeIndex, setActiveIndex] = useState(0);
    const activeRef = useRef(0);
    useEffect(() => {
        activeRef.current = activeIndex;
    }, [activeIndex])

    const [insertHeight, setInsertHeight] = useState();

    const [visible, setVisible] = useState(false);

    const [coverInfo, setCoverInfo] = useState({
        temporaryName: "定格真我 触手可及",
        temporaryDesc: "To 哇印定制",
        bookName: "定格真我 触手可及",
        description: "To 哇印定制",
    });

    const [editVisible, setEditVisible] = useState(false);

    const beforeUpload = (index, list) => {
        setActiveIndex(index);
        if (userImageList.length > 0) {
            setVisible(true);
            return false;
        }
    };

    const onChange = (file, fileList, index) => {
        if (file.status == 'done') {
            dispatch({
                type: 'confirmOrder/mutateUserImageList',
                payload: {
                    userImage: file,
                    index: index || activeRef.current
                }
            })
        }
    };

    const editFinish = (index, res) => {

        const coverList = [
            ...userImageList
        ];

        coverList[index] = res[0];

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
                        bookName: coverInfo.bookName,
                        description: coverInfo.description
                    }
                }

                return {
                    ...resultItem,
                    synthesisList: synthesis(index == 0 ? 'bookCover' : 'bookPage', {
                        ...resultItem,
                        bookName: coverInfo.bookName,
                        description: coverInfo.description,
                        date: day().format('MM/DD YYYY')
                    })
                }
            } else {
                return null
            }
        })

        resultList.push({
            imgInfo: null,
            cropInfo: null,
            originImage: 'https://cdn.91daiwo.com/back_cover.jpg',
            cropImage: 'https://cdn.91daiwo.com/back_cover.jpg',
            printNums: 1,
            synthesisList: [],
            restInfo: {
                isBack: true
            }
        })

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
        if (!coverInfo.temporaryName && !coverInfo.temporaryDesc) {
            return false;
        }
        setCoverInfo({
            ...coverInfo,
            bookName: coverInfo.temporaryName,
            description: coverInfo.temporaryDesc,
        })
        setEditVisible(false)
    };

    // 存入作品集
    const handleSaveWorks = () => {
        if (!userImageList.length) {
            Taro.showToast({
                title: '请上传照片',
                icon: 'none',
                duration: 1500
            })
            return
        }
        const resultList = handleResultList()
        dispatch({
            type: 'confirmOrder/savePortfolio',
            payload: {
                resultList
            }
        })
    };

    const date = day().format('MM/DD YYYY');

    return (
        <View className="index">
            <View className="header">显示区域即为打印区域，如需调整请点击图片</View>
            <View className="content">
                <View className="item-box">
                    <View className="cover">
                        <View className="cover-top">
                            <View className="edit-box">
                                <View
                                    className="title-box"
                                    onClick={() => {
                                        setEditVisible(true);
                                        setCoverInfo((coverInfo) => {
                                            return {
                                                ...coverInfo,
                                                temporaryDesc: coverInfo.description,
                                                temporaryName: coverInfo.bookName
                                            }
                                        });
                                    }}>
                                    <Text className="title">{coverInfo.bookName}</Text>
                                    <Image src={editIcon} className="edit-icon" />
                                </View>
                                <View className="description">
                                    {coverInfo.description}
                                </View>
                            </View>
                            <Image src={wayin} mode="aspectFit" className="wayin" />
                        </View>
                        <UploadCrop beforeUpload={beforeUpload.bind(this, 0)} editFinish={editFinish.bind(this, 0)} fileList={userImageList[0] ? [userImageList[0]] : []} onChange={onChange} width={555} height={472} className="cover-con" />
                        <View className="date-wrap">{ date }</View>
                    </View>
                    <View className="page-num">封面</View>
                </View>
                {
                    twinsList.map((item, index) => {
                        return (
                            <View className="twins-item item-box" key={index}>
                                <View className="item-body">
                                    {
                                        item.map((child, i) => {
                                            const imgIndex = index * 2 + i + 1;
                                            const file = userImageList[imgIndex] ? [userImageList[imgIndex]] : []
                                            return (
                                                <View className="choose-item" key={i}>
                                                    <UploadCrop editFinish={editFinish.bind(this, imgIndex)} beforeUpload={beforeUpload.bind(this, imgIndex)} fileList={file} onChange={onChange} width={320} height={320} />
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                                <View className="page-num">{`${++index * 2 - 1} - ${index * 2}`}</View>
                            </View>
                        )
                    })
                }
            </View>
            <BottomButton onChange={(file, fileList) => { onChange(file, fileList, -1) }} onSave={handleSaveWorks} goPrint={submit} limit={17} />
            <SelectPicModal onChange={onChange} imgList={lodash.uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }} />
            <Modal visible={editVisible} onClose={() => { setEditVisible(false); setInsertHeight(0) }}>
                <View className="modal-content">
                    <View className="input-content">
                        <View className="input-item">
                            <Text className="title">名称</Text>
                            <Input
                                name='name'
                                type='text'
                                maxlength={12}
                                placeholder='最多12个字'
                                cursorSpacing="130"
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
                                maxlength={20}
                                placeholder='最多20个字'
                                cursorSpacing="91"
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
                    <View className="operate-content" style={{paddingBottom: insertHeight}}>
                        <View className="left-btn" onClick={() => { setEditVisible(false) }}>取消</View>
                        <View className={`right-btn ${coverInfo.temporaryName || coverInfo.temporaryDesc ? 'clickable' : ''}`} onClick={handleEditCover}>确认</View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectBook);
