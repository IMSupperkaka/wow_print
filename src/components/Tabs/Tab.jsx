import React from 'react';
import classnams from 'classnames';
import { View } from '@tarojs/components';

import './index.less';

export default (props) => {
    return (
        <View {...props} className={classnams('wy-tabs__item', props.active ? 'wy-tabs__active' : '')}>
            {props.title}
        </View>
    )
}
