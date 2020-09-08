import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

export default (props) => {
    return (
        <View className="wy-cell">
            {
                props.title &&
                <View>{ props.title}</View>
            }
            <View>
                {
                    props.value || props.children
                }
            </View>
        </View>
    )
}