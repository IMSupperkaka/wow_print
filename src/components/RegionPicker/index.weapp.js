import React from 'react';
import { Picker } from '@tarojs/components';

export default (props) => {
    return (
        <Picker {...props} mode='region'>{ props.children }</Picker>
    );
};
