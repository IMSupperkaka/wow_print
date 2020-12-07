import React, { useState, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { View, Image, Button } from '@tarojs/components';

import defaultModelList from './model';
import { computeCropUrl } from '../../../utils/utils';
import useCrop from '../../../hooks/useCrop';
import Upload from '../../../components/Upload';
import Tabs from '../../../components/Tabs';
import TabPanel from '../../../components/TabPanel';
import Transition from '../../../components/Transition';
import CropImg from '../../../components/CropImg';
import styles from './index.module.less';
import stageBg from '../../images/bg_fram@2x.png';
import addIcon from '../../../../images/cion_add_to5@2x.png';
import tipsOnIcon from '../../../../images/icon_prompt_on@2x.png';
import tipsOffIcon from '../../../../images/icon_prompt_off@2x.png';
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

const StageView = (props) => {

    const [current, setCurrent] = useState(0);

    const [fold, setFold] = useState(false);

    const [fileList, setFileList] = useState(props.confirmOrder.stageFileList);

    const [activeModelIndex, setActiveModelIndexIndex] = useState(0);

    const [activeEditAreaIndex, setActiveEditAreaIndex] = useState(null);

    const [modelList, setModelList] = useState(props.confirmOrder.stageModelList);

    const uploadRef = useRef();

    const {
        state: {
            rotate,
            translate,
            scale,
            mirror,
            animate
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
                console.log(cloneList)
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
        if (file.status == 'done' && activeEditAreaIndex != null) {
          mutateActiveImg(file);
        }
        setFileList(fileList)
    }

    const handleUpload = () => {
        uploadRef.current.handleChoose()
    }

    const mutateActiveImg = (img = {}) => {
        setModelList(() => {
            const cloneList = [...modelList];
            const activeArea = cloneList[activeModelIndex].editArea[activeEditAreaIndex];
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
        const resultList = [
            {
                ...model.editArea[0].img,
                printNums: 1,
                restInfo: {},
                synthesisList: [
                    {
                        type: 'Image',
                        imageUrl: 'https://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
                        width: model.stageInfo.width,
                        height: model.stageInfo.height,
                        offsetX: 0,
                        offsetY: 0
                    },
                    ...model.editArea.map((v) => {
                        return {
                            type: 'Image',
                            imageUrl: computeCropUrl(v.img.originImage || v.img.filePath, {
                                width: v.img.imgInfo.width,
                                height: v.img.imgInfo.height,
                                contentWidth: v.width,
                                contentHeight: v.height
                            }, v.img.cropInfo),
                            width: v.width,
                            height: v.height,
                            offsetX: v.x,
                            offsetY: v.y
                        }
                    }),
                    {
                        type: 'Image',
                        imageUrl: model.stageInfo.filePath,
                        width: model.stageInfo.width,
                        height: model.stageInfo.height,
                        offsetX: 0,
                        offsetY: 0
                    }
                ]
            }
        ]
        dispatch({
            type: 'confirmOrder/pushConfirmOrder',
            payload: {
                resultList
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
                                    {/* <View onClick={handleMirror}>镜像</View> */}
                                    <View onClick={handleChangePic}>换图</View>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                <View className={styles['edit-stage']} style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }}>
                    {
                        activeModel.editArea.map(({ width, height, x, y, img }, index) => {
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
                                console.log(activeEditAreaIndex)
                                _cropProps = cropProps;
                            }
                            const style = {
                                position: 'absolute',
                                width: Taro.pxTransform(width, 750),
                                height: Taro.pxTransform(height, 750),
                                top: Taro.pxTransform(y, 750),
                                left: Taro.pxTransform(x, 750)
                            }
                            console.log(index)
                            console.log(_cropProps)
                            return (
                              <View style={style} onClick={handleShowEdit.bind(this, index)}>
                                <CropImg showIgnoreBtn={false} src={img.filePath} {..._cropProps} />
                              </View>
                            )
                        })
                    }
                    <Image style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }} className={styles['edit-stage-bg']} src={stageBg} />
                    <Image style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }} className={styles['edit-stage-background']} src={activeModel.stageInfo.filePath} />
                </View>
            </View>
            <View onClick={handleHideEdit} className={classnames(styles['bottom-selector'], fold && styles['fold'])}>
                <Image onClick={toggleFold} src={fold ? iconFold : iconUnFold} className={styles['fold']} />
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
                <View className={classnames(styles['bottom-bar'], 'wy-hairline--top')}>
                    <View>已选 {activeModel.name}</View>
                    <Button onClick={goConfirmOrder} className="radius-btn primary-btn">去定制</Button>
                </View>
            </View>
        </View>
    )
}

export default connect(({ confirmOrder }) => ({
    confirmOrder
}))(StageView);
