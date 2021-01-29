
import React, { useContext } from 'react';
import { View, Image } from '@tarojs/components';

import './index.less';
import unselectPng from '@/images/unselect.png';
import selectedPng from '@/images/selected.png';

const RadioContext = React.createContext();

const Radio = (props) => {

    const { value, onChange } = useContext(RadioContext);

    const { className, children, value: _value } = props;

    return (
        <View className={className} onClick={() => { onChange(_value) }}>
            <Image className="wy-radio-icon" src={value == _value ? selectedPng : unselectPng} />
            {children}
        </View>
    )
}

Radio.Group = (props) => {
    return (
        <RadioContext.Provider value={{
            value: props.value,
            onChange: props.onChange
        }}>
            {props.children}
        </RadioContext.Provider>
    )
}

export default Radio;
