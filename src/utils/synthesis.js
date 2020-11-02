/*
 * @Date: 2020-11-01 21:13:59
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-01 22:30:18
 * @FilePath: \wow_print\src\utils\synthesis.js
 * @Description: Descrip Content
 */

const renderMap = {
  deskCalendarCover: ({ backgroundImage, cropImage }) => {
    return [
      {
        type: 'Image',
        imageUrl: backgroundImage,
        width: 2560,
        height: 1828,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 2560,
        height: 1352,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: 'https://cdn.wanqiandaikuan.com/1604024547546_lALPD3lGsDaemp_M9szA_192_246.png',
        width: 232,
        height: 297,
        offsetX: 1164,
        offsetY: 1176
      }
    ]
  },
  deskCalendarPage: ({ backgroundImage, cropImage }) => {
    return [
      {
        type: 'Image',
        imageUrl: backgroundImage,
        width: 2560,
        height: 1828,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 1004,
        height: 1320,
        offsetX: 172,
        offsetY: 316
      }
    ]
  },
  deskCalendarPageHorizontal: ({ backgroundImage, cropImage }) => {
    return [
      {
        type: 'Image',
        imageUrl: backgroundImage,
        width: 2560,
        height: 1828,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 1520,
        height: 864,
        offsetX: 172,
        offsetY: 316
      }
    ]
  },
  bookCover: ({ cropImage, bookName, description }) => {
    return [
      {
        type: 'Image',
        imageUrl: 'http://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
        width: 2560,
        height: 2560,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: 'http://cdn.91jiekuan.com/FuWAks8AFr9u_OujPhO_Q8zhYydw',
        width: 712,
        height: 352,
        offsetX: 1848,
        offsetY: 168
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 2220,
        height: 1888,
        offsetX: 0,
        offsetY: 672
      },
      {
        type: 'Text',
        text: bookName,
        offsetX: 176,
        offsetY: 264,
        textFontSize: 112,
        textColor: [51, 51, 51]
      },
      {
        type: 'Text',
        text: description,
        offsetX: 176,
        offsetY: 448,
        textFontSize: 56,
        textColor: [51, 51, 51]
      }
    ]
  },
  bookPage: ({ cropImage }) => {
    return [
      {
        imageUrl: cropImage,
        width: 1280,
        height: 1280,
        offsetX: 0,
        offsetY: 0
      }
    ]
  }
}

export default (type, imgInfo) => {
  return renderMap[type](imgInfo);
}
