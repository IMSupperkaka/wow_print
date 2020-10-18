import Taro from '@tarojs/taro';
import math from './math';

export const getImgwh = ({ width, height, contentWidth, contentHeight }, scale = 1) => {
    let imgWidth;
    let imgHeight;
    if (width / height <= contentWidth / contentHeight) {
        imgWidth = contentWidth;
        imgHeight = (height / width) * imgWidth;
    } else {
        imgHeight = contentHeight;
        imgWidth = (width / height) * imgHeight;
    }
    return {
        width: imgWidth * scale,
        height: imgHeight * scale
    }
}

export const getCropPosition = ({ width, height, scale, origin, translate: [dx, dy] }, contentWidth, contentHeight, aspectFit = false) => {
    const { width: oWidth, height: oHeight } = getImgwh({ width, height, contentWidth, contentHeight });
    const offsetX = scale * oWidth - contentWidth;
    const offsetY = scale * oHeight - contentHeight;
    const x = origin[0] * offsetX - dx * (contentWidth / 582);
    const y = origin[1] * offsetY - dy * (contentHeight / (582 / 0.7));
    if (aspectFit) {
      return {
        width: oWidth,
        height: oHeight,
        scale: scale,
        x: x,
        y: y
      }
    }
    return {
        width: width,
        height: height,
        scale: oWidth / width * scale,
        x: x,
        y: y
    }
}

export const computeCropUrl = (url, imgInfo) => {

    const radio = 750 / Taro.getSystemInfoSync().screenWidth;
    const { fWidth, width, contentWidth, contentHeight, scale, translate, rotateMatrix } = imgInfo;
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const translateMatrix = math.matrix([[1, 0, translate[0] / radio], [0, 1, translate[1] / radio], [0, 0, 1]]);
    const leftTop = math.multiply(scaleMatrix, translateMatrix, rotateMatrix, math.matrix([0, 0, 1]));
    const as = fWidth / width * scale;
    const cropUrl = `${url}?imageMogr2/auto-orient/crop/!${Math.round(contentWidth / as)}x${Math.round(contentHeight / as)}a${-Math.round(leftTop._data[0] / as)}a${-Math.round(leftTop._data[1] / as)}`;
    return cropUrl;
}

export const initImg = (imginfo, content, to_center = true) => {
  const cloneImginfo = {...imginfo};
  const aspectRadio = imginfo.width / imginfo.height;
  const contentRadio = content.width / content.height;
  // if (aspectRadio > 1) {
  //     const deg = 1.5 * Math.PI;
  //     cloneImginfo.rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
  //     if (1 / aspectRadio > contentRadio) {
  //         cloneImginfo.fWidth = content.height;
  //         cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
  //     } else {
  //         cloneImginfo.fHeight = content.width;
  //         cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
  //     }
  // } else {
  //     if (aspectRadio > contentRadio) {
  //         cloneImginfo.fHeight = content.height;
  //         cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
  //     } else {
  //         cloneImginfo.fWidth = content.width;
  //         cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
  //     }
  //     cloneImginfo.rotateMatrix = math.matrix([[Math.cos(0), Math.sin(0), 0], [-Math.sin(0), Math.cos(0), 0], [0, 0, 1]]);
  // }
  if (aspectRadio > contentRadio) {
      cloneImginfo.fHeight = content.height;
      cloneImginfo.fWidth = cloneImginfo.fHeight * aspectRadio;
  } else {
      cloneImginfo.fWidth = content.width;
      cloneImginfo.fHeight = cloneImginfo.fWidth / aspectRadio;
  }
  cloneImginfo.rotateMatrix = math.matrix([[Math.cos(0), Math.sin(0), 0], [-Math.sin(0), Math.cos(0), 0], [0, 0, 1]]);
  cloneImginfo.translateMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  cloneImginfo.scaleMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  const centerPoint = [content.width / 2, content.height / 2, 1];
  const afterCenterPoint = [cloneImginfo.fWidth / 2, cloneImginfo.fHeight / 2, 1];
  const centerOffset = [centerPoint[0] - afterCenterPoint[0], centerPoint[1] - afterCenterPoint[1]];
  if (to_center) {
    cloneImginfo.translate = [centerOffset[0], centerOffset[1]];
  }
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
