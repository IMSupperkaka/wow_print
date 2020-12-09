/*
 * @Date: 2020-09-28 21:46:46
 * @LastEditors: Shawn
 * @LastEditTime: 2020-12-06 19:35:19
 * @FilePath: \wow_print\src\utils\utils.js
 * @Description: Descrip Content
 */
import Taro from '@tarojs/taro';
import math from './math';
import { EDIT_WIDTH } from './picContent';

const defaultCropInfo = { scale: 1, translate: [0, 0], rotate: 0, mirror: false }

export const computeCropUrl = (url, imgInfo, cropInfo) => {
    const { rotate, scale, translate, editwidth = EDIT_WIDTH } = { ...defaultCropInfo, ...cropInfo }
    const { tWidth } = fitImg({
        width: imgInfo.width,
        height: imgInfo.height,
        contentWidth: imgInfo.contentWidth,
        contentHeight: imgInfo.contentHeight,
        deg: rotate
    });



    
    const { width, height } = imgInfo;
    const scaleTranslate = imgInfo.contentWidth / editwidth;
    const { resizeWidth, resizeHeight } = calcRotatedSize({
        width: width,
        height: height
    }, rotate > 0 ? 360 - rotate : -rotate);
    const as = tWidth / width * scale;
    const isJust = rotate % 90 == 0;
    const dx = -Math.round(translate[0] * scaleTranslate / as + (isJust ? 0 : (resizeWidth - width) / 2));
    const dy = -Math.round(translate[1] * scaleTranslate / as + (isJust ? 0 : (resizeHeight - height) / 2));
    const cropWidth = Math.round(imgInfo.contentWidth / as);
    const cropHeight = Math.round(imgInfo.contentHeight / as);
    // TODO: 当原图orientation非up时 通过七牛剪裁参数不正确
    const cropUrl = `${url}?imageMogr2/gravity/Center/rotate/${rotate > 0 ? 360 - rotate : -rotate}/auto-orient/crop/!${cropWidth}x${cropHeight}${dx >= 0 ? `a${dx}` : dx}${dy >= 0 ? `a${dy}` : dy}`;
    return cropUrl;
}

// 返回剪裁后图片是否模糊
export const computedBlur = ({ contentWidth, contentHeight, width, height, afterWidth, afterHieght, printWidth, printHeight }) => {
    // 总像素
    const totalPixels = width * height;
    // 剪裁区域占图片大小比例
    const place = (contentWidth * contentHeight) / (afterWidth * afterHieght);

    // 剪裁区域显示的总像素
    const displayPixels = totalPixels * place;
    // 每平方厘米所表达的真实像素
    const averagePixel = displayPixels / (printWidth * printHeight);
    // 当每平方厘米所表达的真实像素小于2000时 定义为图片模糊
    const blur = averagePixel < 2000;

    return blur
}

export const toRadians = (angel) => {
    return angel * Math.PI / 180;
}

export const calcRotatedSize = ({ width, height }, angel) => {
    let src = { width, height };
    let temp;

    if (angel >= 90) {
        if (angel / 90 % 2 >= 1) {
            temp = src.height;
            src.height = src.width;
            src.width = temp;
        }
        angel = angel % 90;
    }

    const r = Math.sqrt(src.height * src.height + src.width * src.width) / 2;

    const len = 2 * Math.sin(toRadians(angel) / 2) * r;
    const angel_alpha = (Math.PI - toRadians(angel)) / 2;
    const angel_dalta_width = Math.atan(src.height / src.width);
    const angel_dalta_height = Math.atan(src.width / src.height);

    const len_dalta_width = len * Math.cos(Math.PI - angel_alpha - angel_dalta_width);
    const len_dalta_height = len * Math.cos(Math.PI - angel_alpha - angel_dalta_height);
    const des_width = src.width + len_dalta_width * 2;
    const des_height = src.height + len_dalta_height * 2;

    return {
        resizeWidth: des_width,
        resizeHeight: des_height
    };
}

export const fitImg = ({ width, height, contentWidth, contentHeight, deg = 0 }) => {
    const p = width / height;
    const cp = contentWidth / contentHeight;
    let tWidth = width;
    let tHeight = height;
    let approachDeg = approach([0, -90, -180, -270, -360, 90, 180, 270, 360], deg)
    if (approachDeg % 180 == 0) {
        if (p > cp) {
            tHeight = contentHeight;
            tWidth = p * tHeight;
        } else {
            tWidth = contentWidth;
            tHeight = tWidth / p;
        }
    } else {
        if (1 / p >= cp) {
            tWidth = contentHeight;
            tHeight = tWidth / p;
        } else {
            tHeight = contentWidth;
            tWidth = p * tHeight;
        }
    }
    return {
        tWidth, // 图片真实宽度
        tHeight, // 图片真实高度
        fWidth: approachDeg % 180 == 0 ? tWidth : tHeight, // 显示的宽度
        fHeight: approachDeg % 180 == 0 ? tHeight : tWidth // 显示的高度
    }
}

export const fix = (num, prefix = 0) => {
    if ([null, undefined, NaN].includes(num)) {
        return 0;
    }
    return (num / 100).toFixed(prefix);
}

export const throttle = (callback, time) => {

    let during = false;
    let timer = null;

    return (...params) => {
        if (during) {
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            during = false;
        }, time);
        during = true;
        callback(...params);
    }
}

export const approach = (array, num) => {
    let db = [Math.abs(num - array[0]), 0];
    for (let i = 1; i < array.length; i++) {
        if (Math.abs(num - array[i]) < db[0]) {
            db = [Math.abs(num - array[i]), i]
        }
    }
    return array[db[1]];
}

export const jump = (url, option) => {
    const miniProPageReg = new RegExp('wy://');
    if (typeof url !== 'string') {
        throw new Error('url must be string');
    }
    url = url.trim();
    if (miniProPageReg.test(url)) {
        Taro.navigateTo({
            url: url.replace(miniProPageReg, '/')
        })
    } else {
        openWebview(url, option)
    }
}

export const openWebview = (url, option) => {
    if (process.env.TARO_ENV === 'h5') {
        window.open(url);
    } else{
        Taro.setNavigationBarTitle({
            title: option?.title || '哇印'
        })
        Taro.navigateTo({
            url: `/pages/webview/index?url=${encodeURIComponent(url)}`
        })
    }
}

/**
 * 获取H5页面参数对象
 * @param {*} url 完整的页面路径
 * @param {*} key 要取的页面参数
 */
export const getH5Params = (url, key) => {
    const search = url.split('?')[1];
    const params = search ? search.split('&').reduce((result, v) => {
        const array = v.split('=');
        result[array[0]] = decodeURIComponent(array[1]);
        return result;
    }, {}) : {}
    if (key) {
        return params[key]
    };
    return params
}

/**
 * 获取页面参数对象 兼容h5/weapp
 * @param {*} key 要取的页面参数
 */
export const getRouterParams = (key) => {
    if (process.env.TARO_ENV === 'h5') {
        return getH5Params(location.href, key);
    } else {
        if (key) {
            return Taro.getCurrentInstance().router.params[key];
        }
        return Taro.getCurrentInstance().router.params;
    }
}
