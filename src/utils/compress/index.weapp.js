/*
 * @Date: 2020-11-25 23:14:27
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-29 13:46:59
 * @FilePath: \wow_print\src\utils\compress\index.weapp.js
 * @Description: Descrip Content
 */
import Taro from '@tarojs/taro';

export default async ({ canvasId, filePath, width, height }) => {
    return new Promise((resolve, reject) => {
        const context = Taro.createCanvasContext(canvasId);
        const drawWidth = width > height ? 500 : 500 * (width / height);
        const drawHeight = width > height ? (500 / (width / height)) : 500;
        context.drawImage(filePath, 0, 0, drawWidth, drawHeight)
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
