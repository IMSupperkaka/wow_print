/*
 * @Date: 2020-09-28 21:46:46
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-22 14:20:49
 * @FilePath: \wow_print\src\utils\utils.js
 * @Description: Descrip Content
 */
import Taro from '@tarojs/taro';
import math from './math';
import { EDIT_WIDTH } from './picContent';

const defaultCropInfo = { scale: 1, translate: [0, 0] }

export const computeCropUrl = (url, imgInfo, cropInfo) => {
    const { deg } = cropInfo;
    const { fWidth, fHeight } = fitImg({
        ...imgInfo,
        contentWidth: imgInfo.contentWidth,
        contentHeight: imgInfo.contentHeight,
        deg
    });
    const { width } = imgInfo;
    const { scale, translate } = cropInfo || defaultCropInfo;
    // 当前剪裁宽度的位移 操作时产生的位移需要换算到剪裁宽度
    const scaleTranslate = imgInfo.contentWidth / EDIT_WIDTH;
    // 旋转矩阵
    const rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
    // 缩放矩阵
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    // 位移矩阵
    const translateMatrix = math.matrix([[1, 0, translate[0] * scaleTranslate], [0, 1, translate[1] * scaleTranslate], [0, 0, 1]]);
    // TODO:消除rotateDeg判断
    // 原始左上点坐标
    const leftTopPosition = deg == 0 ? math.matrix([-fWidth / 2, -fHeight / 2, 1]) : math.matrix([-fWidth / 2, fHeight / 2, 1]);
    // 操作后左上点坐标
    const leftTop = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, leftTopPosition);
    // 原图剪裁区域的比例
    const as = fWidth / width * scale;
    // TODO: 当原图orientation非up时 通过七牛剪裁参数不正确
    const cropUrl = `${url}?imageMogr2/rotate/${deg}/auto-orient/crop/!${Math.round(imgInfo.contentWidth / as)}x${Math.round(imgInfo.contentHeight / as)}a${-Math.round((leftTop._data[0] + imgInfo.contentWidth / 2) / as)}a${-Math.round((leftTop._data[1] + imgInfo.contentHeight / 2) / as)}`;
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

export const fitImg = ({ width, height, contentWidth, contentHeight, deg = 0 }) => {
    const p = width / height;
    const cp = contentWidth / contentHeight;
    let tWidth = width;
    let tHeight = height;
    let approachDeg = approach([0,-90,-180,-270,-360,90,180,270,360], deg)
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

export const jump = (url) => {
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
    let paramsString = url.split("?")[1]
    let paramsArray = paramsString.split("&")
    let paramsObject = {}
    paramsArray.forEach((item, index) => {
        let ikey = item.split("=")[0] || index
        let ivalue = item.split("=")[1] || ""
        paramsObject[ikey] = ivalue
    })
    if(key) {
        return paramsObject[key]
    }
    return paramsObject
}

/**
 * 获取页面参数对象 兼容h5/weapp
 * @param {*} key 要取的页面参数
 */
export const getRouterParams = (key) => {
    if(Taro.getEnv() == 'WEB') {
        let paramsObject = {},
        url = Taro.getCurrentInstance().page.path;
        let paramsString = url.split("?")[1];
        let paramsArray = paramsString.split("&");
        paramsArray.forEach((item, index) => {
            let ikey = item.split("=")[0] || index
            let ivalue = item.split("=")[1] || ""
            paramsObject[ikey] = ivalue
        })
        if(key) {
            return paramsObject[key]
        }
        return paramsObject
    } else {
        if(key) {
            return Taro.getCurrentInstance().router.params[key]
        }
        return Taro.getCurrentInstance().router.params;
    }
}
