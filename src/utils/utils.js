/*
 * @Date: 2020-09-28 21:46:46
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-01 21:05:05
 * @FilePath: \wow_print\src\utils\utils.js
 * @Description: Descrip Content
 */
import Taro from '@tarojs/taro';
import math from './math';
import { EDIT_WIDTH } from './picContent';

const defaultCropInfo = { scale: 1, translate: [0, 0] }

export const computeCropUrl = (url, imgInfo, cropInfo) => {
    const { fWidth, fHeight, rotateMatrix, rotateDeg } = initImg(imgInfo, {
        width: imgInfo.contentWidth,
        height: imgInfo.contentHeight
    });
    const { width } = imgInfo;
    const { scale, translate } = cropInfo || defaultCropInfo;
    // 当前剪裁宽度的位移 操作时产生的位移需要换算到剪裁宽度
    const scaleTranslate = imgInfo.contentWidth / EDIT_WIDTH;
    // 缩放矩阵
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    // 位移矩阵
    const translateMatrix = math.matrix([[1, 0, translate[0] * scaleTranslate], [0, 1, translate[1] * scaleTranslate], [0, 0, 1]]);
    // TODO:消除rotateDeg判断
    // 原始左上点坐标
    const leftTopPosition = rotateDeg == 0 ? math.matrix([-fWidth / 2, -fHeight / 2, 1]) : math.matrix([-fWidth / 2, fHeight / 2, 1]);
    // 操作后左上点坐标
    const leftTop = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, leftTopPosition);
    // 原图剪裁区域的比例
    const as = fWidth / width * scale;
    // TODO: 当原图orientation非up时 通过七牛剪裁参数不正确
    const cropUrl = `${url}?imageMogr2/rotate/${rotateDeg}/auto-orient/crop/!${Math.round(imgInfo.contentWidth / as)}x${Math.round(imgInfo.contentHeight / as)}a${-Math.round((leftTop._data[0] + imgInfo.contentWidth / 2) / as)}a${-Math.round((leftTop._data[1] + imgInfo.contentHeight / 2) / as)}`;
    return cropUrl;
}

export const initImg = (imginfo, content) => {
  const cloneImginfo = JSON.parse(JSON.stringify(imginfo));
  const aspectRadio = imginfo.width / imginfo.height;
  const contentRadio = content.width / content.height;
  // TODO:简化流程
  if (aspectRadio > 1) {
      const deg = 1.5 * Math.PI;
      cloneImginfo.rotateDeg = 90;
      cloneImginfo.rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
      if (1 / aspectRadio > contentRadio) {
          cloneImginfo.fWidth = content.height;
          cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
      } else {
          cloneImginfo.fHeight = content.width;
          cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
      }
  } else {
      if (aspectRadio > contentRadio) {
          cloneImginfo.fHeight = content.height;
          cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
      } else {
          cloneImginfo.fWidth = content.width;
          cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
      }
      cloneImginfo.rotateDeg = 0;
      cloneImginfo.rotateMatrix = math.matrix([[Math.cos(0), Math.sin(0), 0], [-Math.sin(0), Math.cos(0), 0], [0, 0, 1]]);
  }
  const centerPoint = [content.width / 2, content.height / 2, 1];
  const afterCenterPoint = [cloneImginfo.fWidth / 2, cloneImginfo.fHeight / 2, 1];
  const centerOffset = [centerPoint[0] - afterCenterPoint[0], centerPoint[1] - afterCenterPoint[1]];
  cloneImginfo.centerOffset = centerOffset;
  return cloneImginfo;
}

export const fix = (num, prefix = 0) => {
    if ([null, undefined, NaN].includes(num)) {
        return 0;
    }
    return (num / 100).toFixed(prefix);
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
