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

    const child = React.cloneElement(props.children, {
        onClick: (e) => {
            setActiveList([]);
        }
    })

    return (
        <Provider value={{
            list: activeList,
            onShow: onShow,
            onHide: onHide
        }} >{child}</Provider>
    )
}

export const CropImgConsumer = Consumer
