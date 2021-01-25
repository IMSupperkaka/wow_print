import { useState, useEffect } from "react"
import Taro from '@tarojs/taro'

let cacheObj = {};

export const getCache= (key) => {
    return cacheObj[key];
}

export const setCache = (key, value) => {
    cacheObj[key] = value;
}

export const removeCache = (key) => {
    delete cacheObj[key];
}

export default (filePath) => {

    const [loading, setLoading] = useState(false);

    const [cachePath, setCachePath] = useState(() => {
        return cacheObj[filePath];
    });

    useEffect(() => {
        setLoading(true);
        if (!getCache(filePath)) {
            Taro.downloadFile({
                url: filePath,
                success: ({ tempFilePath }) => {
                    setLoading(false);
                    setCachePath(tempFilePath);
                    setCache(filePath, tempFilePath);
                },
                fail: () => {
                    setLoading(false);
                    setCachePath(filePath);
                }
            })
        } else {
            setCachePath(getCache(filePath))
        }
    }, [filePath])

    return {
        loading,
        cachePath
    }
}