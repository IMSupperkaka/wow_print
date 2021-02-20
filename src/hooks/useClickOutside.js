import React, { useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';

const isSame = (elem, target) => {
    if (process.env.TARO_ENV === 'h5') {
        return elem == target;
    }
    if (process.env.TARO_ENV === 'weapp') {
        return elem.uid == target.id;
    }
}

const checkChildContain = (elem, target) => {
    if (isSame(elem, target)) {
        return true;
    }
    if (elem.childNodes.length > 0) {
        for (var i = 0; i < elem.childNodes.length; i++) {
            const hasId = checkChildContain(elem.childNodes[i], target);
            if (hasId) {
                return true;
            }
        }
    }
    return false;
}

export default (callback, ref) => {

    const onClickAwayRef = useRef(callback);
    onClickAwayRef.current = callback;

    useEffect(() => {

        const handleClickAway = (e) => {
            if (!checkChildContain(ref.current, e.target)) {
                onClickAwayRef.current(e);
            }
        }

        Taro.eventCenter.on('clickRoot', handleClickAway)

        return () => {
            Taro.eventCenter.off('clickRoot', handleClickAway)
        }

    }, [ref])
}