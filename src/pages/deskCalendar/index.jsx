import React, { useState, useRef, useEffect } from 'react';
import lodash from 'lodash';
import { connect } from 'react-redux';
import { View, Button, Text, Image, Input } from '@tarojs/components';

import './index.less';
import synthesis from '../../utils/synthesis';
import { computeCropUrl } from '../../utils/utils';
import Modal from '../../components/Modal';
import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';
import BottomButton from '../../components/BottomButton';
import editIcon from '../../../images/icon_edit.png';

const sizeMap = new Map([
    [0, { width: 640, height: 295 }],
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
        backgroundImage: 'https://cdn.wanqiandaikuan.com/1604024541910_lALPD3zULtuMBMrNBd3NCDg_2104_1501.png'
    },
    {
        type: 1,
        title: '2021年1月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_01.png'
    },
    {
        type: 1,
        title: '2021年2月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_02.png'
    },
    {
        type: 2,
        title: '2021年3月',
        backgroundImage: 'https://cdn.wanqiandaikuan.com/2021_03.png'
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

    const { dispatch, confirmOrder: { userImageList } } = props;

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

                const cropImage = computeCropUrl(img.originImage, { // 裁剪后地址
                    contentWidth: size.width,
                    contentHeight: size.height,
                    ...img.imgInfo
                }, img.cropInfo)

                const resultItem = {
                    filePath: img.filePath,
                    imgInfo: img.imgInfo, // 图片原始信息 { width, height, ...resetInfo }
                    cropInfo: img.cropInfo, // 裁剪信息
                    originImage: img.originImage, // 图片七牛地址
                    cropImage: cropImage,
                    printNums: 1,
                    restInfo: {}, // 额外信息
                }

                if (index == 0) {
                    resultItem.restInfo.title = coverInfo.title;
                }

                return {
                    ...resultItem,
                    synthesisList: synthesis(synthesisMap.get(item.type), { ...resultItem, backgroundImage: item.backgroundImage, title: coverInfo.title })
                }
            }
        })
    }

    const submit = () => {
        const resultList = getResultList();
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList
            }
        })
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
        <View className="app">
            <View className="tips">
                显示区域即为打印区域，如需调整请点击图片
            </View>
            {
                deskCalenderList.map((item, index) => {

                    const fileList = userImageList[index] ? [userImageList[index]] : [];

                    const styles = {
                        background: `url(${item.backgroundImage})`,
                        backgroundSize: '100% 100%'
                    }

                    const size = sizeMap.get(item.type);

                    return (
                        <View key={index}>
                            {
                                item.type == 0 ?
                                    <View className="calendar-item cover" style={styles}>
                                        <View className="edit-box">
                                            <Text className="title">{coverInfo.title}</Text>
                                            <Image src={editIcon} className="edit-icon" onClick={() => {
                                                setEditVisible(true);
                                                setCoverInfo((coverInfo) => {
                                                    return {
                                                        ...coverInfo,
                                                        temporaryTitle: coverInfo.title
                                                    }
                                                });
                                            }}/>
                                        </View>
                                        <UploadCrop
                                            fileList={fileList}
                                            editFinish={editFinish.bind(this, index)}
                                            beforeUpload={beforeUpload.bind(this, index)}
                                            onChange={onChange}
                                            className="calender-uploader"
                                            {...size}
                                        />
                                    </View> :
                                    <View className="calendar-item page" style={styles}>
                                        <UploadCrop
                                            fileList={fileList}
                                            editFinish={editFinish.bind(this, index)}
                                            beforeUpload={beforeUpload.bind(this, index)}
                                            onChange={onChange}
                                            className="calender-uploader"
                                            {...size}
                                        />
                                    </View>
                            }
                            <View className="calender-title">{item.title}</View>
                        </View>
                    )
                })
            }
            <BottomButton onSave={handleSaveWorks} goPrint={submit} onChange={(file, fileList) => { onChange(file, fileList, -1) }} limit={13} />
            <SelectPicModal limit={activeIndex == -1 ? 9 : 1} onChange={onChange} imgList={lodash.uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }} />
            {/* TODO 封装Form组件 */}
            <Modal visible={editVisible} onClose={() => { setEditVisible(false) }}>
                <View className="modal-content">
                    <View className="input-content">
                        <View className="input-item">
                            <Text className="title">标题</Text>
                            <Input
                                name='name'
                                type='text'
                                maxlength={12}
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
                    <View className="operate-content">
                        <View className="left-btn" onClick={() => { setEditVisible(false) }}>取消</View>
                        <View className={`right-btn ${coverInfo.temporaryTitle ? 'clickable' : ''}`} onClick={handleEditCover}>确认</View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(DeskCalendar);
