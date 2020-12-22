import React, { useState, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { View, Image, Button } from '@tarojs/components';

import useCrop from '../../../hooks/useCrop';
import Upload from '../../../components/Upload';
import Tabs from '../../../components/Tabs';
import TabPanel from '../../../components/TabPanel';
import Transition from '../../../components/Transition';
import CropImg from '../../../components/CropImg';
import imgView from '../../../utils/crop';
import styles from './index.module.less';
import WidthCompressCanvas from '@/layout/WidthCompressCanvas';
import addIcon from '../../../../images/cion_add_to5@2x.png';
import tipsOnIcon from '../../../../images/icon_prompt_on@2x.png';
import tipsOffIcon from '../../../../images/icon_prompt_off@2x.png';
import iconFold from '../../images/icon_edit_fold@2x.png';
import iconUnFold from '../../images/icon_edit_un_fold@2x.png';
import bgProjection from '../../../../images/bg_projection@2x.png';

const Tips = () => {

    const [show, setShow] = useState(true);

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

const buildResultList = (model) => {
    console.log(model);
    const scale = 2;

    const resultList = [
        {
            ...model.editArea[0].img,
            printNums: 1,
            synthesisList: [
                {
                    type: 'IMAGE',
                    imageUrl: 'https://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
                    width: model.stageInfo.width * scale,
                    height: model.stageInfo.height * scale,
                    offsetX: 0,
                    offsetY: 0,
                    isBase: true
                },
                ...model.editArea.map((v) => {

                    const ImgView = new imgView({
                        src: v.img.originImage,
                        width: v.img.imgInfo.width,
                        height: v.img.imgInfo.height
                    })

                    const cropImage = ImgView.crop(v.img.cropInfo, {
                        contentWidth: v.width * scale,
                        contentHeight: v.height * scale
                    })

                    return {
                        type: 'IMAGE',
                        imageUrl: v.img.originImage,
                        offsetX: v.x * scale,
                        offsetY: v.y * scale,
                        ...cropImage,
                        width: v.width * scale,
                        height: v.height * scale
                    }
                })
            ]
        }
    ]

    if (model.stageInfo.filePath) {
        resultList[0].synthesisList.push({
            type: 'IMAGE',
            imageUrl: model.stageInfo.filePath,
            width: model.stageInfo.width * scale,
            height: model.stageInfo.height * scale,
            offsetX: 0,
            offsetY: 0
        })
    }

    return resultList;
}

const StageView = (props) => {

    const [current, setCurrent] = useState(1);

    const [fold, setFold] = useState(false);

    const [fileList, setFileList] = useState(props.confirmOrder.stageFileList);

    const [activeModelIndex, setActiveModelIndexIndex] = useState(0);

    const [activeEditAreaIndex, setActiveEditAreaIndex] = useState(null);

    const [uploadIndex, setUploadIndex] = useState(null);

    const [modelList, setModelList] = useState(props.confirmOrder.stageModelList);

    const uploadRef = useRef();

    const {
        state: {
            mirror
        },
        style,
        touchProps,
        cropProps,
        mutate
    } = useCrop({
        forcefit: ['translate'],
        onFinish: (cropInfo) => {
            setModelList((modelList) => {
                if (activeEditAreaIndex == null) {
                    return modelList;
                }
                const cloneList = [...modelList];
                cloneList[activeModelIndex].editArea[activeEditAreaIndex].img.cropInfo = cropInfo;
                return cloneList;
            })
        }
    });

    useEffect(() => {
        if (activeEditAreaIndex != null) {
            mutateActiveImg()
        }
    }, [activeModelIndex, activeEditAreaIndex])

    const handleOnchange = (file, fileList) => {
        if (file.status == 'done' && (activeEditAreaIndex != null || uploadIndex != null)) {
            mutateActiveImg(file, activeEditAreaIndex == null ? uploadIndex : activeEditAreaIndex);
        }
        setFileList(fileList)
    }

    const handleUpload = (uploadIndex) => {
        setUploadIndex(uploadIndex);
        uploadRef.current.handleChoose();
    }

    const mutateActiveImg = (img = {}, index = activeEditAreaIndex) => {
        setModelList(() => {
            const cloneList = [...modelList];
            const activeArea = cloneList[activeModelIndex].editArea[index];
            activeArea.img = {
                ...activeArea.img,
                ...img
            }
            mutate({
                width: activeArea.img.imgInfo.width,
                height: activeArea.img.imgInfo.height,
                contentWidth: activeArea.width,
                contentHeight: activeArea.height,
                ...activeArea.img.cropInfo
            })
            return cloneList;
        })
    }

    const handleShowEdit = (index, e) => {
        e.stopPropagation();
        e.preventDefault();
        // Taro 阻止事件冒泡超过两级依然冒泡 https://github.com/NervJS/taro/issues/8041
        setTimeout(() => {
            const activeArea = modelList[activeModelIndex].editArea[index];
            mutate({
                width: activeArea.img.imgInfo.width,
                height: activeArea.img.imgInfo.height,
                contentWidth: activeArea.width,
                contentHeight: activeArea.height,
                ...activeArea.img.cropInfo
            })
            setActiveEditAreaIndex(index);
        }, 100)
    }

    const handleHideEdit = () => {
        if (activeEditAreaIndex != null) {
            mutate({
                animate: false
            })
        }
        setActiveEditAreaIndex(null);
    }

    const handleMirror = () => {
        mutate({
            mirror: !mirror
        })
    }

    const handleChangePic = (e) => {
        e.stopPropagation();
        e.preventDefault();
        uploadRef.current.handleChoose();
    }

    const handleChoosePic = (img) => {
        if (activeEditAreaIndex != null) {
            mutateActiveImg(img);
        }
    }

    const toggleFold = () => {
        setFold((fold) => {
            return !fold;
        })
    }

    const goConfirmOrder = () => {
        const { dispatch } = props;
        const model = modelList[activeModelIndex];
        const emptyList = model.editArea.filter((v) => {
            return !v.img;
        })
        if (emptyList.length > 0) {
            return Taro.showToast({
                title: `还可添加${emptyList.length}张照片`,
                icon: 'none',
                duration: 1500
            })
        }
        buildResultList(model)
        return;
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList: buildResultList(model)
            }
        })
    }

    const activeModel = modelList[activeModelIndex];

    const { width, height, x, y } = activeModel.editArea[activeEditAreaIndex || 0];

    const activeAreaStyle = {
        position: 'absolute',
        width: Taro.pxTransform(width, 750),
        height: Taro.pxTransform(height, 750),
        top: Taro.pxTransform(y, 750),
        left: Taro.pxTransform(x, 750)
    }

    const uploadList = [...fileList].reverse();

    return (
        <View className={styles['index']} onClick={handleHideEdit}>
            <Tips />
            {/* trasnform中fixed定位不会定位在根元素上 TODO:小程序中portal实现 */}
            <Upload className={styles['hidden-upload']} ref={uploadRef} fileList={fileList} onChange={handleOnchange} limit={9}></Upload>
            <View className={classnames(styles['edit-container'], fold && styles['fold'])} onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                {
                    activeEditAreaIndex != null &&
                    <View className={styles['edit-stage-absolute']} style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }}>
                        <View style={activeAreaStyle} className={styles['crop-img-extra-wrap']}>
                            <View {...touchProps} className={styles['crop-img-extra']} style={style.contentStyle}>
                                <View data-behavior={['zoom', 'rotate']} className={classnames(styles['crop-extra-zoom'], mirror && styles['mirror'])} />
                                <View className={classnames(styles['crop-extra-bottom'], mirror && styles['mirror'])}>
                                    <View onClick={handleChangePic}>换图</View>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                <View className={styles['edit-stage']} style={{
                    width: Taro.pxTransform(activeModel.stageInfo.width, 750),
                    height: Taro.pxTransform(activeModel.stageInfo.height, 750),
                    '-webkit-mask-image': `url(${activeModel.stageInfo.maskPath})`,
                    '-webkit-mask-size': '100% 100%'
                }}>
                    {
                        activeModel.editArea.map(({ width, height, x, y, img }, index) => {

                            const style = {
                                position: 'absolute',
                                width: Taro.pxTransform(width, 750),
                                height: Taro.pxTransform(height, 750),
                                top: Taro.pxTransform(y, 750),
                                left: Taro.pxTransform(x, 750),
                                zIndex: 2
                            }

                            if (!img) {
                                return (
                                    <View style={style} className={styles['edit-upload']} onClick={handleUpload.bind(this, index)}>
                                        <Image className={styles['upload-icon']} src={addIcon} />
                                    </View>
                                )
                            }

                            let _cropProps = {
                                useProps: false,
                                width: img.imgInfo.width,
                                height: img.imgInfo.height,
                                contentWidth: width,
                                contentHeight: height,
                                cropOption: {
                                    ...img.cropInfo,
                                    editwidth: width
                                },
                                ignoreBlur: true,
                                animate: false
                            }

                            if (activeEditAreaIndex === index) {
                                _cropProps = cropProps;
                            }

                            return (
                                <View style={style} onClick={handleShowEdit.bind(this, index)}>
                                    <CropImg showIgnoreBtn={false} src={img.filePath} {..._cropProps} />
                                </View>
                            )
                        })
                    }
                    <Image style={{
                        width: Taro.pxTransform(activeModel.stageInfo.width, 750),
                        height: Taro.pxTransform(activeModel.stageInfo.height, 750),
                        zIndex: activeModel.stageInfo.bgCover ? 4 : 1 
                    }} className={styles['edit-stage-bg']} src={activeModel.stageInfo.bgPath} />
                    
                    {
                        activeModel.stageInfo.filePath &&
                        <Image style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }} className={styles['edit-stage-background']} src={activeModel.stageInfo.filePath} />
                    }
                </View>
                <Image src={bgProjection} className={styles['bg-projection']}/>
            </View>
            <View onClick={handleHideEdit} className={classnames(styles['bottom-selector'], fold && styles['fold'])}>
                <Image onClick={toggleFold} src={fold ? iconFold : iconUnFold} className={styles['fold']} />
                <Tabs current={current} onChange={setCurrent}>
                    <TabPanel title="图片" className={styles['tab-content']}>
                        <View onClick={handleUpload.bind(this, null)} className={`${styles['upload-area']} ${styles['pic-item']}`}>
                            <Image className={styles['upload-icon']} src={addIcon} />
                        </View>
                        {
                            uploadList.map((v) => {
                                return (
                                    <View className={styles['pic-item']} onClick={handleChoosePic.bind(this, v)}>
                                        <Image className={styles['pic']} src={v.filePath} mode="aspectFill" />
                                    </View>
                                )
                            })
                        }
                    </TabPanel>
                    <TabPanel title="模版" className={styles['tab-content']}>
                        {
                            modelList.map((v, index) => {
                                return (
                                    <View
                                        onClick={() => {
                                            setActiveEditAreaIndex(null)
                                            setActiveModelIndexIndex(index)
                                        }}
                                        className={classnames(styles['pic-item'], index == activeModelIndex && styles['active'])}>
                                        <Image className={styles['pic']} src={v.stageInfo.thumbnail} mode="aspectFill" />
                                    </View>
                                )
                            })
                        }
                    </TabPanel>
                </Tabs>
                <View className={classnames(styles['bottom-bar'])}>
                    <View>已选 {activeModel.name}</View>
                    <Button onClick={goConfirmOrder} className="radius-btn primary-btn">去定制</Button>
                </View>
            </View>
        </View>
    )
}

export default WidthCompressCanvas(connect(({ confirmOrder }) => ({
    confirmOrder
}))(StageView));
