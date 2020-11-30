/*
 * @Description: 秒针倒计时器
 */
import React, { useState, useRef, useEffect } from 'react';

function getSeconds(msec, type) {
    if(msec <= 0) return;
    if(type) {
        switch(type) {
            case 'second':
                return parseInt(msec, 10);
            case 'minute':
                return parseInt(msec * 60, 10)
            case 'hour':
                return parseInt(msec * 60 * 60, 10)
        }
    } else {
        // 不传type则默认参数为毫秒
        return parseInt(msec / 1000, 10)
    }
}

export const useCountDown = (props) => {

    const { msec, payLoad: { type, isUnReset } = {} } = props;

    const initTime = getSeconds(msec, type);
    console.log(initTime)
    
    const [time, setTime] = useState(initTime);

    const timer = useRef();

    const onStart = (callback) => {
        timer.current = setInterval(() => {
            console.log(time, initTime)
            setTime((time) => {
                return --time;
            })
        }, 1000);
        typeof callback === 'function' && callback();
    }

    const onChange = (callback) => {
        typeof callback === 'function' && callback();
    }

    const onEnd = (callback) => {
        clearInterval(time.current);
        if(!isUnReset) {
            setTime(initTime);
        }
        typeof callback === 'function' && callback();
    }

    useEffect(() => {
        console.log(time)
        if(timer.current && time <= 0) {
            onEnd()
        }
        onChange()
        return () => {
            clearInterval(time.current);
        }
    }, [time])

    return {
        onStart,
        onEnd,
        onChange
    }
}