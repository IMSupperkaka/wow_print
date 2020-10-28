import React from 'react';
import { View } from '@tarojs/components';

import './index.less';
import UploadCrop from '../../components/UploadCrop';

const deskCalenderList = [
    {
        type: 'cover',
        title: '封面'
    },
    {
        type: 'page',
        title: '2021年1月'
    }
]

export default () => {

    const onChange = (fileList) => {
        console.log(fileList);
    }

    return (
        <View className="app">
            <View className="tips">
                显示区域即为打印区域，如需调整请点击图片
            </View>
            {
                deskCalenderList.map((item) => {
                    return (
                        <>
                            {
                                item.type == 'cover' ? 
                                <View className="calendar-item cover">
                                    <UploadCrop onChange={onChange} className="calender-uploader" width={640} height={338}/>
                                </View> :
                                <View className="calendar-item page">
                                    <UploadCrop onChange={onChange} className="calender-uploader" width={251} height={330}/>
                                </View>
                            }
                            <View className="calender-title">{ item.title }</View>
                        </>
                    )
                })
            }
        </View>
    )
}
