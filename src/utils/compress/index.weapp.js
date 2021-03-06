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
        try {
            const context = Taro.createCanvasContext(canvasId);
            let drawWidth;
            let drawHeight;
            if (Math.max(width, height) > 2000) {
                if (width > height) {
                    drawWidth = 2000;
                    drawHeight = 2000 / (width / height);
                } else {
                    drawWidth = 2000 * (width / height);
                    drawHeight = 2000;
                }
            } else {
                drawWidth = width;
                drawHeight = height;
            }
            context.drawImage(filePath, 0, 0, drawWidth, drawHeight)
            context.draw(false, () => {
                Taro.canvasToTempFilePath({
                    canvasId: canvasId,
                    width: drawWidth,
                    height: drawHeight,
                    fileType: "jpg",
                    quality: 1,
                    success: ({ tempFilePath }) => {
                        resolve(tempFilePath);
                    },
                    fail: (error) => {
                        reject(error);
                    }
                });
            })
        } catch (error) {
            reject(error);
        }
    })
}
