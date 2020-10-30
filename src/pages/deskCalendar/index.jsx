import React, { useState } from 'react';
import lodash from 'lodash';
import { View, Button, Image } from '@tarojs/components';

import './index.less';
import { connect } from 'react-redux';
import { initImg, computeCropUrl } from '../../utils/utils';
import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';
import BottomButton from '../../components/BottomButton';

const sizeMap = new Map([
    [0, { width: 640, height: 338 }],
    [1, { width: 251, height: 330 }],
    [2, { width: 380, height: 216 }]
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

    const [visible, setVisible] = useState(false);
    const { dispatch, confirmOrder: { userImageList } } = props;

    const onChange = (fileList) => {
        console.log(fileList)
        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: fileList
        })
    }

    const handleReplace = (fileList, index) => {
        let cloneList = [...userImageList];
        cloneList.splice(index, 1, ...fileList);

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: cloneList
        })
    };

    const beforeUpload = () => {
        if (userImageList.length > 0) {
            setVisible(true);
            return false;
        }
    }

    const handleSaveWorks = () => {

    }

    const handleGoPrint = () => {

    }
        
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

    const submit = () => {
        const resultList = deskCalenderList.map((item, index) => {
            const img = userImageList[index];
            const size = sizeMap.get(item.type);
            if (img) {
                return {
                    filePath: img.filePath,
                    imgInfo: img.imgInfo, // 图片原始信息 { width, height, ...resetInfo }
                    cropInfo: img.cropInfo, // 裁剪信息
                    originImage: img.response.data, // 图片七牛地址
                    cropImage: computeCropUrl(img.response.data, { // 裁剪后地址
                        contentWidth: size.width,
                        contentHeight: size.height,
                        ...img.imgInfo
                    }, img.cropInfo),
                    printNums: 1,
                    restInfo: {} // 额外信息
                }
            }
        })
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList
            }
        })
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
                                    <Image src="https://cdn.wanqiandaikuan.com/1604024547546_lALPD3lGsDaemp_M9szA_192_246.png" className="bear"/>
                                    <UploadCrop activeIndex={index} fileList={userImageList} editFinish={editFinish.bind(this, index)} beforeUpload={beforeUpload} onChange={onChange} className="calender-uploader" {...size}/>
                                </View> :
                                <View className="calendar-item page" style={styles}>
                                    <UploadCrop activeIndex={index} fileList={userImageList} editFinish={editFinish.bind(this, index)} beforeUpload={beforeUpload} onChange={onChange} className="calender-uploader" {...size}/>
                                </View>
                            }
                            <View className="calender-title">{ item.title }</View>
                        </View>
                    )
                })
            }
            {/* <BottomButton onChange={onChange} onSave={handleSaveWorks} goPrint={handleGoPrint} limit={13}/> */}
            <SelectPicModal onChange={onChange} onReplace={handleReplace} imgList={lodash.uniqBy(userImageList, 'filePath')} visible={visible} onClose={() => { setVisible(false) }}/>
            {
                userImageList.length < 1 ? 
                <View onClick={beforeUpload} className="bottom-upload-btn">批量上传（需上传 { 13 - userImageList.length } 张照片）</View> :
                <View onClick={submit} className="bottom-upload-btn">确认打印</View>
            }
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(DeskCalendar);
