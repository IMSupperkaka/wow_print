import Taro from '@tarojs/taro';

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
    const aspectRatio = 0.7;
    let contentWidth = imgInfo.width;
    let contentHeight = contentWidth / aspectRatio;
    const originLimitPixle = 200000000;
    const resultLimitPixle = 24999999;
    if (imgInfo.width * imgInfo.height > resultLimitPixle) {
        contentWidth = Math.floor(resultLimitPixle / 2.5);
        contentHeight = contentWidth / aspectRatio;
    }
    const { scale, x, y } = getCropPosition(imgInfo, contentWidth, contentHeight);
    const cropUrl = `${url}?imageMogr2/auto-orient/crop/!${Math.round(contentWidth / scale)}x${Math.round(contentHeight / scale)}a${Math.round(x / scale)}a${Math.round(y / scale)}`;
    return cropUrl;
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
