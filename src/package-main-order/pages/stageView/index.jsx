import React, { useState, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { View, Image, Button } from '@tarojs/components';

import { useCrop, useClickOutside, useInitialValue } from '@/hooks';
import { thumbnail } from '@/hooks/useThumbnail';
import Upload from '@/components/Upload';
import Tabs from '@/components/Tabs';
import TabPanel from '@/components/TabPanel';
import Transition from '@/components/Transition';
import CropImg from '@/components/CropImg';
import imgView from '@/utils/crop';
import styles from './index.module.less';
import Base from '@/layout/Base';
import WidthCompressCanvas from '@/layout/WidthCompressCanvas';
import addIcon from '@/images/cion_add_to5@2x.png';
import tipsOnIcon from '@/images/icon_prompt_on@2x.png';
import tipsOffIcon from '@/images/icon_prompt_off@2x.png';
import iconFold from '../../images/icon_edit_fold@2x.png';
import iconUnFold from '../../images/icon_edit_un_fold@2x.png';

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
    
    const scale = 2;

    const resultList = [
        {
            ...model.editArea[0].img,
            printNums: 1,
            synthesisList: [
                {
                    type: 'IMAGE',
                    imageUrl: 'https://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
                    width: model.fileInfo.fileWidth * scale,
                    height: model.fileInfo.fileHeight * scale,
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
                        offsetX: v.fileX * scale,
                        offsetY: v.fileY * scale,
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
            width: model.fileInfo.fileWidth * scale,
            height: model.fileInfo.fileHeight * scale,
            offsetX: 0,
            offsetY: 0
        })
    }

    return resultList;
}

const StageView = (props) => {

    const [current, setCurrent] = useState(1);

    const [fold, setFold] = useState(false);

    const [fileList, setFileList] = useInitialValue(props.confirmOrder.stageFileList);

    const [activeModelIndex, setActiveModelIndexIndex] = useState(0);

    const [activeEditAreaIndex, setActiveEditAreaIndex] = useState(null);

    const [modelList, setModelList] = useInitialValue(props.confirmOrder.stageModelList);

    const uploadIndexRef = useRef();

    const uploadRef = useRef();

    const editRef = useRef();

    useClickOutside(() => {
        setActiveEditAreaIndex(null);
    }, editRef)

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
                const img = cloneList[activeModelIndex].editArea[activeEditAreaIndex].img;
                img.cropInfo = {
                    ...img.cropInfo,
                    ...cropInfo
                }
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
        if (file.status == 'done' && (activeEditAreaIndex != null || uploadIndexRef.current != null)) {
            mutateActiveImg(file, activeEditAreaIndex == null ? uploadIndexRef.current : activeEditAreaIndex);
        }
        setFileList(fileList)
    }

    const handleUpload = (uploadIndex) => {
        uploadIndexRef.current = uploadIndex;
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
        const activeArea = modelList[activeModelIndex].editArea[index];
        mutate({
            width: activeArea.img.imgInfo.width,
            height: activeArea.img.imgInfo.height,
            contentWidth: activeArea.width,
            contentHeight: activeArea.height,
            ...activeArea.img.cropInfo
        })
        setActiveEditAreaIndex(index);
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
        <View className={styles['index']}>
            <Tips />
            {/* trasnform中fixed定位不会定位在根元素上 TODO:小程序中portal实现 */}
            <Upload className={styles['hidden-upload']} ref={uploadRef} fileList={fileList} onChange={handleOnchange} limit={9}></Upload>
            <View className={classnames(styles['edit-container'], fold && styles['fold'])} onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }} style={{
                background: activeModel.background || ''
            }}>
                {
                    activeEditAreaIndex != null &&
                    <View className={styles['edit-stage-absolute']} style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }}>
                        <View ref={editRef} style={activeAreaStyle} className={styles['crop-img-extra-wrap']}>
                            <View {...touchProps} className={styles['crop-img-extra']} style={style.contentStyle}>
                                <View data-behavior={['zoom', 'rotate']} className={classnames(styles['crop-extra-zoom'], mirror && styles['mirror'])} />
                                <View className={classnames(styles['crop-extra-bottom'], mirror && styles['mirror'])}>
                                    <View onClick={handleChangePic}>换图</View>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                <View className={styles['edit-shadow-wrapper']}>
                    <View className={styles['edit-stage']} style={{
                        width: Taro.pxTransform(activeModel.stageInfo.width, 750),
                        height: Taro.pxTransform(activeModel.stageInfo.height, 750),
                        '-webkit-mask-box-image': `url(${activeModel.stageInfo.maskPath})`,
                        '-webkit-mask-size': '100% 100%',
                        mixBlendMode: activeModel.stageInfo.mixBlendMode
                    }}>
                        {
                            activeModel.editArea.map(({ width, height, x, y, img }, index) => {

                                const style = {
                                    position: 'absolute',
                                    width: Taro.pxTransform(width, 750),
                                    height: Taro.pxTransform(height, 750),
                                    top: Taro.pxTransform(y, 750),
                                    left: Taro.pxTransform(x, 750),
                                    zIndex: 2,
                                }

                                if (!img) {
                                    return (
                                        <View style={style} className={styles['edit-upload']} onClick={handleUpload.bind(this, index)} key={index}>
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
                                    animate: false,
                                    showEdit: false
                                }

                                if (activeEditAreaIndex === index) {
                                    _cropProps = cropProps;
                                }

                                return (
                                    <View style={style} onClick={handleShowEdit.bind(this, index)}>
                                        <CropImg showIgnoreBtn={false} src={img.originImage} {..._cropProps} />
                                    </View>
                                )
                            })
                        }
                        {
                            activeModel.stageInfo.filePath &&
                            <Image style={{ 
                                width: Taro.pxTransform(activeModel.fileInfo.fileWidth, 750), 
                                height: Taro.pxTransform(activeModel.fileInfo.fileHeight, 750),
                                top: Taro.pxTransform(activeModel.fileInfo.y, 750),
                                left: Taro.pxTransform(activeModel.fileInfo.x, 750),
                            }} className={styles['edit-stage-background']} src={activeModel.stageInfo.filePath} />
                        }
                    </View>
                    <Image style={{
                        width: Taro.pxTransform(activeModel.stageInfo.width, 750),
                        height: Taro.pxTransform(activeModel.stageInfo.height, 750),
                        zIndex: activeModel.stageInfo.bgCover ? 4 : 1
                    }} className={styles['edit-stage-bg']} src={activeModel.stageInfo.bgPath} />
                    {
                        activeModel.stageInfo.topDecoration && 
                        <Image src={activeModel.stageInfo.topDecoration} className={styles['top-decoration']} style={{
                            width: Taro.pxTransform(activeModel.stageInfo.width, 750),
                            height: Taro.pxTransform(activeModel.stageInfo.height, 750),
                        }}/>
                    }
                </View>
            </View>
            <View className={classnames(styles['bottom-selector'], fold && styles['fold'])}>
                <Image onClick={toggleFold} src={fold ? iconFold : iconUnFold} className={styles['fold']} />
                <Tabs current={current} onChange={setCurrent}>
                    <TabPanel title="图片" className={styles['tab-content']}>
                        <View onClick={handleUpload.bind(this, null)} className={`${styles['upload-area']} ${styles['pic-item']}`}>
                            <Image className={styles['upload-icon']} src={addIcon} />
                        </View>
                        {
                            uploadList.map((v, index) => {
                                return (
                                    <View className={styles['pic-item']} onClick={handleChoosePic.bind(this, v)} key={index}>
                                        <Image className={styles['pic']} src={thumbnail(v.originImage)} mode="aspectFill" />
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
                                        className={classnames(styles['pic-item'], index == activeModelIndex && styles['active'])} key={index}>
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

export default Base(
    WidthCompressCanvas(
        connect(({ confirmOrder }) => ({
            confirmOrder
        }))(StageView)
    )
)