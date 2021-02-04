import React, { useLayoutEffect } from 'react';
import Taro from '@tarojs/taro';

const checkChildContain = (elem, id) => {
    if (elem.uid == id) {
        return true;
    }
    if (elem.childNodes.length > 0) {
        for (var i = 0; i < elem.childNodes.length; i++) {
            const hasId = checkChildContain(elem.childNodes[i], id);
            if (hasId) {
                return true;
            }
        }
    }
    return false;
}

export default (callback, ref) => {
    useLayoutEffect(() => {

        const handleClickAway = (e) => {
            if (!checkChildContain(ref.current, e.target.id)) {
                callback(e);
            }
        }

        Taro.eventCenter.on('clickRoot', handleClickAway)

        return () => {
            Taro.eventCenter.off('clickRoot', handleClickAway)
        }

    }, [])
}