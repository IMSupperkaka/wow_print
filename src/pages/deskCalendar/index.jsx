import React, { useState } from 'react';
import lodash from 'lodash';
import { View, Button } from '@tarojs/components';

import './index.less';
import { connect } from 'react-redux';
import UploadCrop from '../../components/UploadCrop';
import SelectPicModal from '../../components/SelectPicModal';

const deskCalenderList = [
    {
        type: 'cover',
        title: '封面'
    },
    {
        type: 'page',
        title: '2021年1月'
    },
    {
        type: 'page',
        title: '2021年2月'
    },
    {
        type: 'page',
        title: '2021年3月'
    },
    {
        type: 'page',
        title: '2021年4月'
    },
    {
        type: 'page',
        title: '2021年5月'
    },
    {
        type: 'page',
        title: '2021年6月'
    },
    {
        type: 'page',
        title: '2021年7月'
    },
    {
        type: 'page',
        title: '2021年8月'
    },
    {
        type: 'page',
        title: '2021年9月'
    },
    {
        type: 'page',
        title: '2021年10月'
    },
    {
        type: 'page',
        title: '2021年11月'
    },
    {
        type: 'page',
        title: '2021年12月'
    }
]

const DeskCalendar = (props) => {

    const [visible, setVisible] = useState(false);
    const { dispatch, confirmOrder: { userImageList } } = props;

    const onChange = (fileList) => {

        const coverList = [
            ...userImageList,
            ...fileList
        ];

        dispatch({
            type: 'confirmOrder/saveUserImageList',
            payload: lodash.uniqBy(coverList, 'uid')
        })
    }

    const beforeUpload = () => {
        if (userImageList.length > 0) {
            setVisible(true);
            return false;
        }
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

    return (
        <View className="app">
            <View className="tips">
                显示区域即为打印区域，如需调整请点击图片
            </View>
            {
                deskCalenderList.map((item, index) => {

                    const fileList = userImageList[index] ? [userImageList[index]] : [];

                    return (
                        <>
                            {
                                item.type == 'cover' ? 
                                <View className="calendar-item cover">
                                    <UploadCrop editFinish={editFinish.bind(this, index)} beforeUpload={beforeUpload} fileList={fileList} onChange={onChange} className="calender-uploader" width={640} height={338}/>
                                </View> :
                                <View className="calendar-item page">
                                    <UploadCrop editFinish={editFinish.bind(this, index)} beforeUpload={beforeUpload} fileList={fileList} onChange={onChange} className="calender-uploader" width={251} height={330}/>
                                </View>
                            }
                            <View className="calender-title">{ item.title }</View>
                        </>
                    )
                })
            }
            <View onClick={beforeUpload} className="bottom-upload-btn">批量上传（需上传 17 张照片）</View>
            <SelectPicModal onChange={onChange} imgList={lodash.uniqBy(userImageList, 'filePath')} visible={visible} onClose={() => { setVisible(false) }}/>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(DeskCalendar);
