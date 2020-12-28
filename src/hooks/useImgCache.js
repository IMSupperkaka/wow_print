import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
/**
 * @example: const { get, set, del } = useImgCache({ goodId });
 */

export const useImgCache = (props) => {

    // expireTime: 过期时间(毫秒)( (new Date()).getTime() + 缓存时间毫秒数 )

    const { goodId } = props;
    console.log(goodId)

    const get = () => {
        const imgCache = Taro.getStorageSync(`imgCache${goodId}`) || {};
        const expireTime = imgCache?.expireTime;
        if(expireTime && (new Date()).getTime() > expireTime) {
            del();
            return [];
        }
        return imgCache;
    }

    const set = (imgCache = { list: [], expireTime: null }) => {
        Taro.setStorageSync(`imgCache${goodId}`, imgCache);
    }

    const del = () => {
        Taro.setStorageSync(`imgCache${goodId}`, { list: [], expireTime: null });
    }

    return {
        get,
        set,
        del
    }
}