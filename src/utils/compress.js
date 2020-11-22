/*
 * @Date: 2020-11-21 19:40:18
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-21 21:25:24
 * @FilePath: \wow_print\src\utils\compress.js
 * @Description: Descrip Content
 */

import Taro from '@tarojs/taro';

export const compressImg = ({ filePath }) => {
  // 创建离屏canvas
  const offscreenCanvas = Taro.createOffscreenCanvas();
  const ctx = offscreenCanvas.getContext('webgl');
  return ctx;
}
