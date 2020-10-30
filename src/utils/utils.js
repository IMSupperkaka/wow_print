import Taro from '@tarojs/taro';
import math from './math';

export const computeCropUrl = (url, imgInfo) => {
    const { fWidth, fHeight, width, contentWidth, contentHeight, scale, translate, rotateMatrix, rotateDeg } = imgInfo;
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const translateMatrix = math.matrix([[1, 0, translate[0]], [0, 1, translate[1]], [0, 0, 1]]);
    // TODO:消除rotateDeg判断
    const leftTopPosition = rotateDeg == 0 ? math.matrix([-fWidth / 2, -fHeight / 2, 1]) : math.matrix([-fWidth / 2, fHeight / 2, 1]);
    const leftTop = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, leftTopPosition);
    const as = fWidth / width * scale;
    const cropUrl = `${url}?imageMogr2/rotate/${rotateDeg}/auto-orient/crop/!${Math.round(contentWidth / as)}x${Math.round(contentHeight / as)}a${-Math.round((leftTop._data[0] + contentWidth / 2) / as)}a${-Math.round((leftTop._data[1] + contentHeight / 2) / as)}`;
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
//   cloneImginfo.translateMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
//   cloneImginfo.scaleMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  const centerPoint = [content.width / 2, content.height / 2, 1];
  const afterCenterPoint = [cloneImginfo.fWidth / 2, cloneImginfo.fHeight / 2, 1];
  const centerOffset = [centerPoint[0] - afterCenterPoint[0], centerPoint[1] - afterCenterPoint[1]];
  cloneImginfo.centerOffset = centerOffset;
//   cloneImginfo.translate = [0, 0];
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
