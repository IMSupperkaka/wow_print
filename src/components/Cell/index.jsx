import React from 'react';
import { View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import classNames from 'classnames';
import './index.less';

export default (props) => {

    const { title, children, value, isLink } = props;
    const hasValue = children || value || isLink;

    return (
        <View className={classNames('wy-cell', props.className)} onClick={props.onClick}>
            {
                title &&
                <View className="wy-cell_title">{ title}</View>
            }
            {
                hasValue &&
                <View className="wy-cell_value">
                    { children || value }
                    {
                        isLink &&
                        <AtIcon className="wy-cell_link" value='chevron-right' size='14' color='#999'></AtIcon>
                    }
                </View>
            }
        </View>
    )
}