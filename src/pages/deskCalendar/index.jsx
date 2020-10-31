import React, { useState } from 'react';
import lodash from 'lodash';
import { View, Button, Image } from '@tarojs/components';

import './index.less';
import { connect } from 'react-redux';
import { computeCropUrl } from '../../utils/utils';
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
    const [activeIndex, setActiveIndex] = useState(0);
    const { dispatch, confirmOrder: { userImageList } } = props;

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
    }

    const beforeUpload = (index) => {
        if (userImageList.length > 0) {
            setActiveIndex(index);
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

    const submit = () => {
        const resultList = deskCalenderList.map((item, index) => {
            const img = userImageList[index];
            const size = sizeMap.get(item.type);
            if (img) {
                return {
                    filePath: img.filePath,
                    imgInfo: img.imgInfo, // 图片原始信息 { width, height, ...resetInfo }
                    cropInfo: img.cropInfo, // 裁剪信息
                    originImage: img.originImage, // 图片七牛地址
                    cropImage: computeCropUrl(img.originImage, { // 裁剪后地址
                        contentWidth: size.width,
                        contentHeight: size.height,
                        ...img.imgInfo
                    }, img.cropInfo),
                    printNums: 1,
                    restInfo: {} // 额外信息
                }
            } else {
              return null;
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
                            <View className="calender-title">{ item.title }</View>
                        </View>
                    )
                })
            }
            <BottomButton onChange={(file, fileList) => { onChange(file, fileList, -1) }} limit={13}/>
            <SelectPicModal limit={activeIndex == -1 ? 9 : 1} onChange={onChange} imgList={lodash.uniqBy(userImageList, 'originImage')} visible={visible} onClose={() => { setVisible(false) }}/>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(DeskCalendar);
