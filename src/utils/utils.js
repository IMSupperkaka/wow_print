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

export const getCropPosition = ({ width, height, scale, origin, translate: [dx, dy] }, contentWidth, contentHeight) => {
    const { width: oWidth, height: oHeight } = getImgwh({ width, height, contentWidth, contentHeight });
    const offsetX = scale * oWidth - contentWidth;
    const offsetY = scale * oHeight - contentHeight;
    const x = origin[0] * offsetX - dx * (contentWidth / 582);
    const y = origin[1] * offsetY - dy * (contentHeight / 833);
    return {
        width: width,
        height: height,
        scale: oWidth / width * scale,
        x: x,
        y: y
    }
}


export const computeCropUrl = (url, imgInfo) => {
    const contentWidth = 1050;
    const contentHeight = 1500;
    const { scale, x, y } = getCropPosition(imgInfo, contentWidth, contentHeight);
    const cropUrl = `${url}?imageMogr2/auto-orient/thumbnail/!${scale * 100}p/crop/!${contentWidth}x${contentHeight}a${x}a${y}`;
    return cropUrl;
}
