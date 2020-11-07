import React, { useState } from 'react';

const { Provider, Consumer } = React.createContext([]);

export const CropImgProvider = (props) => {

    const [activeList, setActiveList] = useState([]);

    const onShow = (key) => {
        setActiveList((activeList) => {
            return [key];
        })
    }

    const onHide = (key) => {
        setActiveList([]);
    }

    return (
        <Provider value={{
            list: activeList,
            onShow: onShow,
            onHide: onHide
        }} >{props.children}</Provider>
    )
}

export const CropImgConsumer = Consumer
