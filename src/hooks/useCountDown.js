/**
 * @Description: 倒计时器
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * @example:
 * const {count, open, close, reopen, reset} = useCountDown({
        initTime: 60 * 60 * 2 * 1000,
        payLoad: {
            format: 'mm:ss',
            onChange: (e) => {
                console.log('timing...')
            }
        }
    })
 */

// 时间戳差值转换时分秒
const turnS = (time) => {
    let initSeconds = time / 1000;
    return initSeconds
}

const turnMS = (time) => {
    let initSeconds = time / 1000;
    let minutes = parseInt(initSeconds / 60, 10);
    let seconds = parseInt(initSeconds % 60, 10);
    let ms = `${minutes.toString().length < 2 ? '0' + minutes : minutes}:${seconds.toString().length < 2 ? '0' + seconds : seconds}`
    return ms
}

const turnHMS = (time) => {
    let initSeconds = time / 1000;
    let hour = parseInt(initSeconds / (60 * 60), 10);
    let minutes = parseInt((initSeconds % (60 * 60)) / 60, 10);
    let seconds = parseInt((initSeconds % (60 * 60)) % 60, 10);
    let hms = `${hour.toString().length < 2 ? '0' + hour : hour}:${minutes.toString().length < 2 ? '0' + minutes : minutes}:${seconds.toString().length < 2 ? '0' + seconds : seconds}`
    return hms
}

function getFormatFn(format) {
    if(format) {
        if(typeof format === 'string') {
            format = format.toLowerCase();
        }
        switch(format) {
            case 'ss':
                return turnS
            case 'mm:ss':
                return turnMS
            case 'hh:mm:ss':
                return turnHMS
            default:
                return turnS
        }
    } else {
        return turnS
    }
}

export default (props) => {

    /**
     * initTime:初始值单位是毫秒
     */
    const { initTime, payLoad: { format = 'ss', onChange = (e) => {} }} = props;

    const customFormat = useCallback(getFormatFn(format),[format]);
    
    const [mesc, setMesc] = useState(initTime);
    
    const [count, setCount] = useState(customFormat(initTime));

    const timer = useRef();

    const clear = () => {
        console.log('清除倒计时')
        clearInterval(timer.current);
        timer.current = null;
    }

    const reset = () => {
        console.log('重置时间', count);
        setMesc(initTime);
        setCount(customFormat(initTime));
        clear();
    }

    const open = () => {
        if(count <= 0) return;
        if(timer.current) return;
        console.log('开始倒计时', count);
        timer.current = setInterval(() => {
            setMesc((mesc) => {
                mesc = mesc - 1000;
                setCount(() => {
                    onChange({count});
                    return customFormat(mesc);
                });
                return mesc;
            })
        }, 1000);
    }

    const close = () => {
        console.log('停止倒计时', count);
        clear();
    }

    const reopen = () => {
        console.log('重置倒计时', count);
        reset();
        open();
    }

    useEffect(() => {
        if(timer.current && count <= 0) {
            close()
        }
        return clear;
    }, [])

    return {
        count,
        open,
        close,
        reopen,
        reset
    }
}