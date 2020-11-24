import React, { useState, useRef } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { View, Image, Button } from '@tarojs/components';

import math from '../../../utils/math'
import useCrop from '../../../hooks/useCrop';
import Upload from '../../../components/Upload';
import Tabs from '../../../components/Tabs';
import TabPanel from '../../../components/TabPanel';
import Transition from '../../../components/Transition';
import CropImg from '../../../components/CropImg';
import styles from './index.module.less';
import addIcon from '../../../../images/cion_add_to5@2x.png';
import tipsOnIcon from '../../../../images/icon_prompt_on@2x.png';
import tipsOffIcon from '../../../../images/icon_prompt_off@2x.png';
import iconZoom from '../../../../images/icon_zoom@2x.png';
import iconFold from '../../images/icon_edit_fold@2x.png';
import iconUnFold from '../../images/icon_edit_un_fold@2x.png';

const Tips = () => {

    const [show, setShow] = useState(false);

    const handleToggle = () => {
        setShow((show) => {
            return !show;
        })
    }

    return (
        <View className={styles['tips-wrap']}>
            <Transition in={show} timeout={300} classNames="fade-in">
                <View className={styles['tips-content']}>显示区域即为打印区域，如需调整请点击图片</View>
            </Transition>
            <Image onClick={handleToggle} className={styles['tips-icon']} src={show ? tipsOffIcon : tipsOnIcon} />
        </View>
    )
}

export default () => {

    const [current, setCurrent] = useState(0);

    const [fold, setFold] = useState(false);

    const [fileList, setFileList] = useState([]);

    const [activeModelIndex, setActiveModelIndexIndex] = useState(0);

    const [activeEditAreaIndex, setActiveEditAreaIndex] = useState(null);

    const {
        state: {
            rotate,
            translate,
            scale,
            mirror,
            isTouch
        },
        touchProps,
        mutate
    } = useCrop({
        forcefit: ['translate'],
        onFinish: (cropInfo) => {
            setModelList((modelList) => {
                const cloneList = [...modelList];
                cloneList[activeModelIndex].editArea[activeEditAreaIndex].img.cropInfo = cropInfo;
                return cloneList;
            })
        }
    });

    const [modelList, setModelList] = useState([
        {
            name: "模板001",
            stageInfo: {
                width: 604,
                height: 440,
                filePath: 'https://cdn.91jiekuan.com/FjApI7ErjIw6MXZ2SjFEo0ZUtZfj'
            },
            editArea: [
                {
                    x: 0,
                    y: 0,
                    width: 604,
                    height: 330,
                    img: {
                        filePath: "https://cdn.91jiekuan.com/Ftptl0OYThDemOJt7Zi-DDfhuYHf"
                    }
                }
            ]
        },
        {
            name: "模板002",
            stageInfo: {
                width: 604,
                height: 440,
                filePath: 'https://cdn.91jiekuan.com/FjApI7ErjIw6MXZ2SjFEo0ZUtZfj'
            },
            editArea: [
                {
                    x: 0,
                    y: 0,
                    width: 604,
                    height: 440,
                    img: {
                        filePath: "https://cdn.91jiekuan.com/Ftptl0OYThDemOJt7Zi-DDfhuYHf"
                    }
                }
            ]
        }
    ]);

    const uploadRef = useRef();

    const handleOnchange = (file, fileList) => {
        if (file.status == 'done' && activeEditAreaIndex != null) {
            setModelList((modelList) => {
                const cloneList = [...modelList];
                cloneList[activeModelIndex].editArea[activeEditAreaIndex].img = file;
                return cloneList;
            })
        }
        setFileList(fileList)
    }

    const handleUpload = () => {
        uploadRef.current.handleChoose()
    }

    const handleToggleEdit = (index) => {
        if (activeEditAreaIndex != index) {
            const activeArea = modelList[activeModelIndex].editArea[index];
            const img = activeArea.img;
            setActiveEditAreaIndex(index);
            Taro.getImageInfo({
                src: img.filePath,
                success: (res) => {
                    mutate({
                        width: res.width,
                        height: res.height,
                        contentWidth: activeArea.width,
                        contentHeight: activeArea.height,
                        ...img.cropInfo
                    })
                }
            })
        } else {
            setActiveEditAreaIndex(null);
        }
    }

    const handleMirror = (e) => {
        e.stopPropagation();
        e.preventDefault();
        mutate({
            mirror: !mirror
        })
    }

    const handleChangePic = (e) => {
        e.stopPropagation();
        e.preventDefault();
        uploadRef.current.handleChoose()
    }

    const handleChoosePic = (img) => {
        if (activeEditAreaIndex != null) {
            setModelList((modelList) => {
                const cloneList = [...modelList];
                cloneList[activeModelIndex].editArea[activeEditAreaIndex].img = img;
                return cloneList;
            })
        }
    }

    const toggleFold = () => {
        setFold((fold) => {
            return !fold;
        })
    }

    const activeModel = modelList[activeModelIndex];

    return (
        <View className={styles['index']}>
            <Tips />
            {/* swiper中fixed定位不会定位在window上 暂时先放在外面调用 */}
            <Upload className={styles['hidden-upload']} ref={uploadRef} fileList={fileList} onChange={handleOnchange} limit={9}></Upload>
            <View className={classnames(styles['edit-container'], fold && styles['fold'])} onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <View className={styles['edit-stage']} style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }}>
                    <Image style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }} className={styles['edit-stage-background']} src={activeModel.stageInfo.filePath} />
                    {
                        activeModel.editArea.map(({ width, height, x, y, img }, index) => {

                            const cropOption = {
                                rotate,
                                translate,
                                scale,
                                mirror,
                                ignoreBlur: true
                            }

                            const style = {
                                position: 'absolute',
                                top: Taro.pxTransform(x, 750),
                                left: Taro.pxTransform(y, 750),
                                zIndex: 0
                            }

                            return <CropImg onClick={handleToggleEdit.bind(this, index)} extra={({
                                transformStyle
                            }) => {
                                return (
                                    activeEditAreaIndex == index &&
                                    <View {...touchProps} className={styles['crop-img-extra']} style={transformStyle}>
                                        <Image data-behavior={['zoom', 'rotate']} src={iconZoom} className={classnames(styles['crop-extra-zoom'], mirror && styles['mirror'])} />
                                        <View className={classnames(styles['crop-extra-bottom'], mirror && styles['mirror'])}>
                                            <View onClick={handleMirror}>镜像</View>
                                            <View onClick={handleChangePic}>换图</View>
                                        </View>
                                    </View>
                                )
                            }} style={style} showIgnoreBtn={false} width={width} height={height} src={img.filePath} cropOption={cropOption} animate={!isTouch}/>
                        })
                    }
                </View>
            </View>
            <View className={classnames(styles['bottom-selector'], fold && styles['fold'])}>
                <Image onClick={toggleFold} src={fold ? iconFold : iconUnFold} className={styles['fold']}/>
                <Tabs current={current} onChange={setCurrent}>
                    <TabPanel title="图片" className={styles['tab-content']}>
                        <View onClick={handleUpload} className={`${styles['upload-area']} ${styles['pic-item']}`}>
                            <Image className={styles['upload-icon']} src={addIcon} />
                        </View>
                        {
                            fileList.map((v) => {
                                return (
                                    <View className={styles['pic-item']} onClick={handleChoosePic.bind(this, v)}>
                                        <Image className={styles['pic']} src={v.filePath} mode="aspectFill" />
                                    </View>
                                )
                            })
                        }
                    </TabPanel>
                    <TabPanel title="模板" className={styles['tab-content']}>
                        {
                            modelList.map((v, index) => {
                                return (
                                    <View
                                        onClick={() => {
                                            setActiveModelIndexIndex(index)
                                        }}
                                        className={classnames(styles['pic-item'], index == activeModelIndex && styles['active'])}>
                                        <Image className={styles['pic']} src={v.stageInfo.filePath} mode="aspectFill" />
                                    </View>
                                )
                            })
                        }
                    </TabPanel>
                </Tabs>
                <View className={classnames(styles['bottom-bar'], 'wy-hairline--top')}>
                    <View>已选 {activeModel.name}</View>
                    <Button className="radius-btn primary-btn">去定制</Button>
                </View>
            </View>
        </View>
    )
}
