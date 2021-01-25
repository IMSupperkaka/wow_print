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
        if (cachePath) {
            setCache(filePath, cachePath);
        } else {
            removeCache(filePath);
        }
    }, [filePath, cachePath])

    useEffect(() => {
        setLoading(true);
        if (!getCache(filePath)) {
            Taro.downloadFile({
                url: filePath,
                success: ({ tempFilePath }) => {
                    setLoading(false);
                    setCachePath(tempFilePath);
                },
                fail: () => {
                    setLoading(false);
                    setCachePath(filePath);
                }
            })
        }
    }, [filePath])

    return {
        loading,
        cachePath
    }
}