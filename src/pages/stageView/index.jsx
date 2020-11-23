import React, { useState, useRef } from 'react';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { View, Image, Button } from '@tarojs/components';

import Upload from '../../components/Upload';
import Tabs from '../../components/Tabs';
import TabPanel from '../../components/TabPanel';
import Transition from '../../components/Transition';
import CropImg from '../../components/CropImg';
import styles from './index.module.less';
import addIcon from '../../../images/cion_add_to5@2x.png';
import tipsOnIcon from '../../../images/icon_prompt_on@2x.png';
import tipsOffIcon from '../../../images/icon_prompt_off@2x.png';
import iconZoom from '../../../images/icon_zoom@2x.png';

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
      <Image onClick={handleToggle} className={styles['tips-icon']} src={show ? tipsOffIcon : tipsOnIcon}/>
    </View>
  )
}

export default () => {

    const [current, setCurrent] = useState(0);

    const [fileList, setFileList] = useState([]);

    const [activeModelIndex, setActiveModelIndexIndex] = useState(0);

    const [activeEditAreaIndex, setActiveEditAreaIndex] = useState(null);

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
            defaultImg: "https://cdn.91jiekuan.com/Ftptl0OYThDemOJt7Zi-DDfhuYHf"
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
            defaultImg: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1606048623706&di=966a18a4a0424fb413a8c908608f9e65&imgtype=0&src=http%3A%2F%2Fp0.qhimgs4.com%2Ft0178ceae651f69d823.jpg"
          }
        ]
      }
    ]);

    const uploadRef = useRef();

    const handleOnchange = (file, fileList) => {
      setFileList(fileList)
    }

    const handleUpload = () => {
      uploadRef.current.handleChoose()
    }

    const handleToggleEdit = (index) => {
      if (activeEditAreaIndex != index) {
        setActiveEditAreaIndex(index);
      } else {
        setActiveEditAreaIndex(null);
      }
    }

    const activeModel = modelList[activeModelIndex];

    return (
        <View className={styles['index']}>
            <Tips/>
            {/* swiper中fixed定位不会定位在window上 暂时先放在外面调用 */}
            <Upload className={styles['hidden-upload']} ref={uploadRef} fileList={fileList} onChange={handleOnchange} limit={9}></Upload>
            <View className={styles['edit-container']}>
              <View className={styles['edit-stage']} style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }}>
                <Image style={{ width: Taro.pxTransform(activeModel.stageInfo.width, 750), height: Taro.pxTransform(activeModel.stageInfo.height, 750) }} className={styles['edit-stage-background']} src={activeModel.stageInfo.filePath}/>
                {
                  activeModel.editArea.map(({ width, height, x, y, defaultImg }, index) => {

                    const cropOption = {
                      rotate: 0,
                      translate: [0, 0],
                      scale: 1,
                      ignoreBlur: true
                    }

                    const style = {
                      position: 'absolute',
                      top: Taro.pxTransform(x, 750),
                      left: Taro.pxTransform(y, 750),
                      zIndex: 0
                    }

                    return <CropImg onClick={handleToggleEdit.bind(this, index)} extra={(transformStyle) => {
                      return (
                        <Transition in={activeEditAreaIndex == index} timeout={300} classNames="fade-in">
                          <View className={styles['crop-img-extra']} style={transformStyle}>
                            <Image src={iconZoom} className={styles['crop-extra-zoom']} />
                            <View className={styles['crop-extra-bottom']}>
                              <View>调整</View>
                              <View>换图</View>
                            </View>
                          </View>
                        </Transition>
                      )
                    }} style={style} showIgnoreBtn={false} width={width} height={height} src={defaultImg} cropOption={cropOption}/>
                  })
                }
              </View>
            </View>
            <View className={styles['bottom-selector']}>
                <Tabs current={current} onChange={setCurrent}>
                    <TabPanel title="图片" className={styles['tab-content']}>
                      <View onClick={handleUpload} className={`${styles['upload-area']} ${styles['pic-item']}`}>
                        <Image className={styles['upload-icon']} src={addIcon}/>
                      </View>
                      {
                        fileList.map((v) => {
                          return (
                            <View className={styles['pic-item']}>
                              <Image className={styles['pic']} src={v.filePath} mode="aspectFill"/>
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
                              <Image className={styles['pic']} src={v.stageInfo.filePath} mode="aspectFill"/>
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
