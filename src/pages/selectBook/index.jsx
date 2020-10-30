import React, { useState, useEffect } from 'react'
import { View, Image, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import './index.less'
import lodash from 'lodash';

import { add, edit, detail } from '../../services/portfolio';

import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';
import BottomButton from '../../components/BottomButton';
import Modal from '../../components/Modal';


import { SELECT_WIDTH } from '../../utils/picContent'
import { uploadFile } from '../../services/upload'
import { list } from '../../services/address'
import Dialog from '../../components/Dialog'
import editIcon from '../../../images/icon_edit.png'
import wayin from '../../../images/cover_wayin.png'

const SelectBook = ({ dispatch, confirmOrder }) => {

    const { coupon, userImageList, proportion, goodId, portfolioId, type } = confirmOrder;

    const [progress, setProgress] = useState({
        visible: false,
        totalNum: 0,
        completeNum: 0
    });

    const [visible, setVisible] = useState(false);

    const [coverInfo, setCoverInfo] = useState({
        name: null,
        desc: null
    });

    const [editVisible, setEditVisible] = useState(false);

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

    useEffect(() => {
        if(portfolioId) {
            detail(portfolioId)
        }
    }, [])

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

    const handleEditCover = () => {
        if(!coverInfo.name && !coverInfo.name) {
            Taro.showToast({
                title:'请输入封面信息',
                icon: 'none',
                duration: 1000
            })
            return
        }
        let cloneList = [...userImageList];
        cloneList[0].name = coverInfo.name;
        cloneList[0].desc = coverInfo.desc;
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
        setEditVisible(false)
    }

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
        if(!userImageList.length) {
            Taro.showToast({
                title:'请上传照片',
                icon: 'none',
                duration: 1500
            })
            return
        }
        if(portfolioId) {
            Taro.showModal({
                title: '确认保存',
                content: '将覆盖原作品，是否确认保存当前修改？',
                confirmText: '确认',
                cancelText: '取消',
                confirmColor: '#FF6345',
                success: (res) => {
                    if (res.confirm) {
                        edit({
                            portfolioId: portfolioId,
                            userImageList: userImageList
                        }).then(() => {
                            Taro.showToast({
                                title:'作品集保存成功',
                                icon: 'none',
                                duration: 1500
                            })
                        })
                    }
                }
            })
        } else {
            add({
                goodId: goodId,
                userImageList: userImageList
            }).then(({ data }) => {
                // 作品集未满 存入成功保存返回的portfolioId
                if(data.data.portfolioId) {
                    Taro.showToast({
                        title:'作品集保存成功',
                        icon: 'none',
                        duration: 2000
                    })
                    dispatch({
                        type: 'confirmOrder/savePortfolioId',
                        payload: data.data.portfolioId
                    })
                } else {
                    // 作品集已满 提示用户作品集已经满了
                    Taro.showModal({
                        title: '提示',
                        content: '作品集已满，请清除过多的作品~',
                        confirmText: '去清除',
                        cancelText: '取消',
                        confirmColor: '#FF6345',
                        success: (res) => {
                            if (res.confirm) {
                                Taro.navigateTo({
                                    url: '/pages/portfolio/index'
                                })
                            }
                        }
                    })
                }
            })
        }
    };

    const handleReplace = (fileList, index) => {
        let cloneList = [...userImageList];
        cloneList.splice(index, 1, ...fileList);

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
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
                                    <Image src={editIcon} className="edit-icon" onClick={() => setEditVisible(true)}/>
                                </View>
                                <View className="description">
                                    To 哇印定制
                                </View>
                            </View>
                            <Image src={wayin} mode="aspectFit" className="wayin"/>
                        </View>
                        <UploadCrop count={17 - userImageList.length} beforeUpload={beforeUpload} fileList={userImageList[0] ? [userImageList[0]] : []} onChange={onChange} width={555} height={472} className="cover-con"/>
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
                                                    <UploadCrop count={17 - userImageList.length} beforeUpload={beforeUpload} fileList={file} onChange={onChange} width={320} height={320}/>
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
            <BottomButton onChange={onChange} onSave={handleSaveWorks} goPrint={handleGoPrint} limit={17}/>
            <Dialog className="upload-dialog" title={`已上传${progress.completeNum}/${progress.totalNum}张`} visible={progress.visible}>
                <View>正在拼命上传中，请耐心等待哦～</View>
            </Dialog>
            <SelectPicModal onChange={onChange} onReplace={handleReplace} imgList={lodash.uniqBy(userImageList, 'filePath')} visible={visible} onClose={() => { setVisible(false) }}/>
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
                                value={coverInfo.name}
                                onInput={(event) => {
                                    setCoverInfo({
                                        ...coverInfo,
                                        name: event.detail.value
                                    })
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
                                value={coverInfo.desc}
                                onInput={(event) => {
                                    setCoverInfo({
                                        ...coverInfo,
                                        desc: event.detail.value
                                    })
                                }}
                            />
                        </View>
                    </View>
                    <View className="operate-content">
                        <View className="left-btn" onClick={() => {setEditVisible(false)}}>取消</View>
                        <View className={`right-btn ${coverInfo.name || coverInfo.desc ? 'clickable' : ''}`} onClick={handleEditCover}>确认</View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(SelectBook);
