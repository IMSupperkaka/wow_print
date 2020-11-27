import Taro from '@tarojs/taro';

export default ({ canvasId, filePath, width, height }) => {
    return new Promise((resolve, reject) => {
        const context = Taro.createCanvasContext(canvasId);
        const drawWidth = width > height ? 500 : 500 * (width / height);
        const drawHeight = width > height ? (500 / (width / height)) : 500;
        context.drawImage(img, 0, 0, drawWidth, drawHeight)
        context.draw(false, () => {
            Taro.canvasToTempFilePath({
                canvasId: "compress-canvas",
                width: drawWidth,
                height: drawHeight,
                fileType: "jpg",
                quality: 1,
                success: ({ tempFilePath }) => {
                    resolve(tempFilePath);
                },
                complete: (result) => {
                    console.log(result);
                }
            });
        })
    })
}