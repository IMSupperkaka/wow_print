import React, { useState, useEffect, useRef } from 'react'
import classnams from 'classnames'
import { View, Image, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import day from 'dayjs'
import { connect } from 'react-redux'
import styles from './index.module.less'
import lodash from 'lodash';

import imgView from '../../utils/crop';
import UploadCrop from '../../components/UploadCrop';
import { CropImgProvider } from '../../components/CropImg';
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

    const { userImageList } = confirmOrder;

    const [activeIndex, setActiveIndex] = useState(0);
    const activeRef = useRef(0);
    useEffect(() => {
        activeRef.current = activeIndex;
    }, [activeIndex])

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
            const content = index == 0 ? { contentWidth: 555, contentHeight: 472 } : { contentWidth: 320, contentHeight: 328.5 };
            if (img) {

                const ImgView = new imgView({
                    src: img.originImage,
                    width: img.imgInfo.width,
                    height: img.imgInfo.height
                })

                const cropImage = ImgView.crop(img.cropInfo, {
                    contentWidth: content.contentWidth,
                    contentHeight: content.contentHeight
                })

                const resultItem = {
                    imgInfo: img.imgInfo, // 图片原始信息 { width, height, ...resetInfo }
                    cropInfo: img.cropInfo, // 裁剪信息
                    originImage: img.originImage, // 图片七牛地址
                    cropImage: cropImage.cropUrl,
                    printNums: 1,
                    restInfo: {
                        bookName: coverInfo.bookName,
                        description: coverInfo.description
                    }
                }

                if (index == 0) {
                    return {
                        ...resultItem,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                imageUrl: 'https://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
                                width: 2560,
                                height: 2560,
                                offsetX: 0,
                                offsetY: 0,
                                isBase: true
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: 'https://cdn.91jiekuan.com/FuWAks8AFr9u_OujPhO_Q8zhYydw',
                                width: 712,
                                height: 352,
                                offsetX: 1600,
                                offsetY: 168
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: img.originImage,
                                offsetX: 0,
                                offsetY: 672,
                                ...cropImage,
                                width: 2220,
                                height: 1888
                            },
                            {
                                type: 'TEXT',
                                text: resultItem.restInfo.bookName,
                                textFontFamily: "微软雅黑",
                                offsetX: 176,
                                offsetY: 264,
                                textFontSize: 112,
                                textColor: [51, 51, 51]
                            },
                            {
                                type: 'TEXT',
                                text: resultItem.restInfo.description,
                                textFontFamily: "微软雅黑",
                                offsetX: 176,
                                offsetY: 448,
                                textFontSize: 56,
                                textColor: [51, 51, 51]
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: 'https://cdn.91daiwo.com/back.png',
                                width: 312,
                                height: 76,
                                offsetX: 2064,
                                offsetY: 2244
                            },
                            {
                                type: 'TEXT',
                                text: day().format('MM/DD YYYY'),
                                textFontFamily: "微软雅黑",
                                offsetX: 2090,
                                offsetY: 2250,
                                textFontSize: 48,
                                textColor: [255, 255, 255]
                            }
                        ]
                    }
                } else {
                    return {
                        ...resultItem,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                offsetX: 0,
                                offsetY: 0,
                                imageUrl: img.originImage,
                                isBase: true,
                                ...cropImage,
                                width: 2560,
                                height: 2628
                            }
                        ]
                    }
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
            synthesisList: [
                {
                    type: 'IMAGE',
                    offsetX: 0,
                    offsetY: 0,
                    imageUrl: 'https://cdn.91daiwo.com/back_cover.jpg',
                    isBase: true,
                    width: 2560,
                    height: 2628
                }
            ],
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
        <CropImgProvider>
            <View className={styles['index']}>
                <View className={styles['header']}>显示区域即为打印区域，如需调整请点击图片</View>
                <View className={styles['content']}>
                    <View className={styles['item-box']}>
                        <View className={styles['cover']}>
                            <View className={styles['cover-top']}>
                                <View className={styles['edit-box']}>
                                    <View
                                        className={styles['title-box']}
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
                                        <Text className={styles['title']}>{coverInfo.bookName}</Text>
                                        <Image src={editIcon} className={styles['edit-icon']} />
                                    </View>
                                    <View className={styles['description']}>
                                        {coverInfo.description}
                                    </View>
                                </View>
                                <Image src={wayin} className={styles['wayin']} />
                            </View>
                            <UploadCrop beforeUpload={beforeUpload.bind(this, 0)} editFinish={editFinish.bind(this, 0)} fileList={userImageList[0] ? [userImageList[0]] : []} onChange={onChange} width={555} height={472} className={styles['cover-con']} />
                            <View className={styles['date-wrap']}>{ date }</View>
                        </View>
                        <View className={styles['page-num']}>封面</View>
                    </View>
                    {
                        twinsList.map((item, index) => {
                            return (
                                <View className={classnams(styles['twins-item'], styles['item-box'])} key={index}>
                                    <View className={styles['item-body']}>
                                        {
                                            item.map((child, i) => {
                                                const imgIndex = index * 2 + i + 1;
                                                const file = userImageList[imgIndex] ? [userImageList[imgIndex]] : []
                                                return (
                                                    <View className={styles['choose-item']} key={i}>
                                                        <UploadCrop editFinish={editFinish.bind(this, imgIndex)} beforeUpload={beforeUpload.bind(this, imgIndex)} fileList={file} onChange={onChange} width={320} height={328.5} />
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                    <View className={styles['page-num']}>{`${++index * 2 - 1} - ${index * 2}`}</View>
                                </View>
                            )
                        })
                    }
                </View>
                <BottomButton onChange={(file, fileList) => { onChange(file, fileList, -1) }} onSave={handleSaveWorks} goPrint={submit} limit={17} />
                <SelectPicModal onChange={onChange} imgList={lodash.uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }} />
                <Modal visible={editVisible} onClose={() => { setEditVisible(false) }}>
                    <View className={styles['modal-content']}>
                        <View className={styles['input-content']}>
                            <View className={styles['input-item']}>
                                <Text className={styles['title']}>名称</Text>
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
                            <View className={styles['input-item']}>
                                <Text className={styles['title']}>昵称</Text>
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
                        <View className={styles['operate-content']}>
                            <View className={styles['left-btn']} onClick={() => { setEditVisible(false) }}>取消</View>
                            <View className={classnams(styles['right-btn'], coverInfo.temporaryName || coverInfo.temporaryDesc ? styles['clickable'] : '')} onClick={handleEditCover}>确认</View>
                        </View>
                    </View>
                </Modal>
            </View>
        </CropImgProvider>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectBook);
