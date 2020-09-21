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

export const computeCropUrl = (url, { contentWidth, contentHeight, width, height, origin, scale, translate: [dx, dy] }) => {
    const { width: oWidth, height: oHeight } = getImgwh({ width, height, contentWidth, contentHeight });
    const offsetX = scale * oWidth - contentWidth;
    const offsetY = scale * oHeight - contentHeight;
    const x = origin[0] * offsetX - dx ;
    const y = origin[1] * offsetY - dy;
    const cropUrl = `${url}?imageMogr2/auto-orient/thumbnail/!${oWidth / width * scale * 100}p/crop/!582x833a${x}a${y}`;
    console.log(cropUrl)
    return cropUrl;
}
