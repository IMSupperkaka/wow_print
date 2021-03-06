import React, { useState, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import { connect } from 'react-redux';
import { View, Text, Image, Input } from '@tarojs/components';

import styles from './index.module.less';
import imgView from '@/utils/crop';
import { Modal, UploadCrop, SelectPicModal, BottomButton } from '@/components';
import Base from '@/layout/Base';
import WidthCompressCanvas from '@/layout/WidthCompressCanvas';
import editIcon from '@/images/icon_edit.png';
import day from 'dayjs';

const sizeMap = new Map([
    [0, { width: 554, height: 295 }],
    [1, { width: 251, height: 330 }],
    [2, { width: 380, height: 216 }]
])

const synthesisMap = new Map([
    [0, 'deskCalendarCover'],
    [1, 'deskCalendarPage'],
    [2, 'deskCalendarPageHorizontal']
])

const deskCalenderList = [
    {
        type: 0,
        title: '封面',
        backgroundImage: 'http://cdn.91jiekuan.com/FqN_smIn-RwjaSz5iaw8uCpYyCzv'
    },
    {
        type: 1,
        title: '2021年1月',
        backgroundImage: 'http://cdn.91jiekuan.com/Fp38mEmlX73WVzbZf21MNP4eQ989'
    },
    {
        type: 1,
        title: '2021年2月',
        backgroundImage: 'http://cdn.91jiekuan.com/FhhHQfZBrKuByg4l7hqW4S_g7Q4f'
    },
    {
        type: 2,
        title: '2021年3月',
        backgroundImage: 'http://cdn.91jiekuan.com/FpY5xOXeHiGapio6RADUEoES6A0V'
    },
    {
        type: 1,
        title: '2021年4月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_04.png'
    },
    {
        type: 1,
        title: '2021年5月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_05.png'
    },
    {
        type: 2,
        title: '2021年6月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_06.png'
    },
    {
        type: 1,
        title: '2021年7月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_07.png'
    },
    {
        type: 1,
        title: '2021年8月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_08.png'
    },
    {
        type: 2,
        title: '2021年9月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_09.png'
    },
    {
        type: 1,
        title: '2021年10月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_10.png'
    },
    {
        type: 1,
        title: '2021年11月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_11.png'
    },
    {
        type: 2,
        title: '2021年12月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_12.png'
    }
]

const DeskCalendar = (props) => {

    const { dispatch, confirmOrder: { userImageList, goodId } } = props;

    const title = userImageList[0]?.restInfo?.title || '定格真我 触手可及';

    const [visible, setVisible] = useState(false);
    const [coverInfo, setCoverInfo] = useState({
        temporaryTitle: title,
        title: title
    });
    const [editVisible, setEditVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeRef = useRef(0);

    useEffect(() => {
        activeRef.current = activeIndex;
    }, [activeIndex])

    // useEffect(() => {
    //     dispatch({
    //         type: 'confirmOrder/initUserImgList'
    //     })
    // }, [])

    const onChange = (file, fileList, index) => {
        if (file.status == 'done') {
            dispatch({
                type: 'confirmOrder/mutateUserImageList',
                payload: {
                    userImage: file,
                    index: index || activeRef.current
                },
                expireTime: day().add(3, 'day').valueOf()
            })
        }
    }

    const beforeUpload = (index) => {
        setActiveIndex(index);
        if (userImageList.length > 0) {
            setVisible(true);
            return false;
        }
    }

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

    const getResultList = () => {
        return deskCalenderList.map((item, index) => {
            const img = userImageList[index];
            const size = sizeMap.get(item.type);
            if (img) {

                const ImgView = new imgView({
                    src: img.originImage,
                    width: img.imgInfo.width,
                    height: img.imgInfo.height
                })

                const resultItem = {
                    imgInfo: img.imgInfo,
                    cropInfo: img.cropInfo,
                    originImage: img.originImage,
                    printNums: 1,
                    restInfo: {
                        title: coverInfo.title
                    }
                }

                if (index == 0) {
                    return {
                        ...resultItem,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                imageUrl: item.backgroundImage,
                                width: 2560,
                                height: 1828,
                                offsetX: 0,
                                offsetY: 0,
                                isBase: true
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: img.originImage,
                                offsetX: 172,
                                offsetY: 172,
                                ...ImgView.crop(img.cropInfo, {
                                    contentWidth: size.width,
                                    contentHeight: size.height
                                }),
                                width: 2216,
                                height: 1180
                            },
                            {
                                type: 'TEXT',
                                text: coverInfo.title,
                                textFontFamily: "微软雅黑",
                                offsetY: 1432,
                                offsetX: 2560 / 2 - (72 * coverInfo.title.length / 2),
                                textFontSize: 72,
                                textAlignCenter: true,
                                textColor: [102, 102, 102]
                            }
                        ]
                    }
                }

                if (item.type == 1) {
                    return {
                        ...resultItem,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                imageUrl: item.backgroundImage,
                                width: 2560,
                                height: 1828,
                                offsetX: 0,
                                offsetY: 0,
                                isBase: true
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: img.originImage,
                                offsetX: 172,
                                offsetY: 316,
                                ...ImgView.crop(img.cropInfo, {
                                    contentWidth: size.width,
                                    contentHeight: size.height
                                }),
                                width: 1004,
                                height: 1320
                            },
                        ]
                    }
                }

                if (item.type == 2) {
                    return {
                        ...resultItem,
                        synthesisList: [
                            {
                                type: 'IMAGE',
                                imageUrl: item.backgroundImage,
                                width: 2560,
                                height: 1828,
                                offsetX: 0,
                                offsetY: 0,
                                isBase: true
                            },
                            {
                                type: 'IMAGE',
                                imageUrl: img.originImage,
                                offsetX: 172,
                                offsetY: 316,
                                ...ImgView.crop(img.cropInfo, {
                                    contentWidth: size.width,
                                    contentHeight: size.height
                                }),
                                width: 1520,
                                height: 864
                            },
                        ]
                    }
                }
            }
        })
    }

    const goConfirmOrder = () => {
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList: getResultList()
            }
        })
    }

    const submit = () => {
        const group = groupBy(userImageList, (v) => {
            if (!v?.cropInfo) {
                return 'empty'
            }
            if (v.cropInfo.blur && !v.cropInfo.ignoreBlur) {
                return 'blur';
            }
            return 'normal'
        })
        if (group?.blur?.length > 0) {
            return Taro.showModal({
                title: '温馨提示',
                content: '图片存在模糊或太长的问题，建议调整，以免影响打印效果。无操作视为可以打印',
                confirmText: '确认打印',
                cancelText: '去调整',
                confirmColor: '#FF6345',
                success: (res) => {
                    if (res.confirm) {
                        goConfirmOrder();
                    }
                }
            })
        }
        goConfirmOrder();
    }

    const handleSaveWorks = () => {
        if (!userImageList.length) {
            return Taro.showToast({
                title: '请上传照片',
                icon: 'none',
                duration: 1500
            })
        }
        const resultList = getResultList()
        dispatch({
            type: 'confirmOrder/savePortfolio',
            payload: {
                resultList
            }
        })
    }

    const handleEditCover = () => {
        if (!coverInfo.temporaryTitle) {
            return false;
        }
        setCoverInfo({
            ...coverInfo,
            title: coverInfo.temporaryTitle
        })
        setEditVisible(false)
    }

    return (
        <View className={styles['app']}>
            <View className={styles['tips']}>
                显示区域即为打印区域，如需调整请点击图片
            </View>
            {
                deskCalenderList.map((item, index) => {

                    const fileList = userImageList[index] ? [userImageList[index]] : [];

                    const style = {
                        background: `url(${item.backgroundImage})`,
                        backgroundSize: '100% 100%'
                    }

                    const size = sizeMap.get(item.type);

                    return (
                        <View key={index}>
                            {
                                item.type == 0 ?
                                    <View className={`${styles['calendar-item']} ${styles['cover']}`} style={style}>
                                        <View className={styles['edit-box']}>
                                            <Text className={styles['title']}>{coverInfo.title}</Text>
                                            <Image src={editIcon} className={styles['edit-icon']} onClick={() => {
                                                setEditVisible(true);
                                                setCoverInfo((coverInfo) => {
                                                    return {
                                                        ...coverInfo,
                                                        temporaryTitle: coverInfo.title
                                                    }
                                                });
                                            }} />
                                        </View>
                                        <UploadCrop
                                            fileList={fileList}
                                            editFinish={editFinish.bind(this, index)}
                                            beforeUpload={beforeUpload.bind(this, index)}
                                            onChange={onChange}
                                            className={styles['calender-uploader']}
                                            {...size}
                                        />
                                    </View> :
                                    <View className={`${styles['calendar-item']} ${styles['page']}`} style={style}>
                                        <UploadCrop
                                            fileList={fileList}
                                            editFinish={editFinish.bind(this, index)}
                                            beforeUpload={beforeUpload.bind(this, index)}
                                            onChange={onChange}
                                            className={styles['calender-uploader']}
                                            {...size}
                                        />
                                    </View>
                            }
                            <View className={styles['calender-title']}>{item.title}</View>
                        </View>
                    )
                })
            }
            <BottomButton onSave={handleSaveWorks} goPrint={submit} onChange={(file, fileList) => { onChange(file, fileList, -1) }} limit={13} />
            <SelectPicModal limit={activeIndex == -1 ? 9 : 1} onChange={onChange} imgList={uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }} />
            {/* TODO 封装Form组件 */}
            <Modal visible={editVisible} onClose={() => { setEditVisible(false) }}>
                <View className={styles['modal-content']}>
                    <View className={styles['input-content']}>
                        <View className={styles['input-item']}>
                            <Text className={styles['title']}>标题</Text>
                            <Input
                                name='name'
                                type='text'
                                maxlength={12}
                                cursorSpacing="91"
                                placeholder='最多12个字'
                                adjustPosition
                                placeholderStyle="color: #C1C1C1"
                                value={coverInfo.temporaryTitle}
                                onInput={(event) => {
                                    setCoverInfo({
                                        ...coverInfo,
                                        temporaryTitle: event.detail.value
                                    })
                                    return event.detail.value
                                }}
                            />
                        </View>
                    </View>
                    <View className={styles['operate-content']}>
                        <View className={styles['left-btn']} onClick={() => { setEditVisible(false) }}>取消</View>
                        <View className={`${styles['right-btn']} ${coverInfo.temporaryTitle ? styles['clickable'] : ''}`} onClick={handleEditCover}>确认</View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Base(
    WidthCompressCanvas(
        connect(({ confirmOrder }) => ({
            confirmOrder
        }))(DeskCalendar)
    )
)
