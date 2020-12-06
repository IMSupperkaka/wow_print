/*
 * @Date: 2020-12-05 14:18:35
 * @LastEditors: Shawn
 * @LastEditTime: 2020-12-05 14:52:06
 * @FilePath: \wow_print\upgrade.js
 * @Description: Descrip Content
 */
var shell = require('shelljs');

var version = process.argv[3]

var packageList = [
  '@tarojs/components',
  '@tarojs/react',
  '@tarojs/runtime',
  '@tarojs/taro',
  '@tarojs/mini-runner',
  '@tarojs/webpack-runner',
  'babel-preset-taro',
  'eslint-config-taro'
]

var shellcmd = packageList.map((package) => {
  return `${package}@${version}`;
}).join(' ');

shell.exec(`yarn upgrade ${shellcmd}`)

shell.exec(`yarn global add @tarojs/cli@${version}`)
