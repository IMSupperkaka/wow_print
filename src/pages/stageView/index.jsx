import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button } from '@tarojs/components';

import Upload from '../../components/Upload';
import Tabs from '../../components/Tabs';
import TabPanel from '../../components/TabPanel';
import styles from './index.module.less';

export default () => {

    const [current, setCurrent] = useState(0);

    return (
        <View className={styles['index']}>
            <View className={styles['bottom-selector']}>
                <Tabs current={current} onChange={setCurrent}>
                    <TabPanel title="图片">
                        <Upload>
                            <View>上传</View>
                        </Upload>
                    </TabPanel>
                    <TabPanel title="模板">
                        2
                    </TabPanel>
                </Tabs>
                <View className={styles['bottom-bar']}>
                    <View>已选 模板001</View>
                    <Button className="radius-btn primary-btn">去定制</Button>
                </View>
            </View>
        </View>
    )
}
