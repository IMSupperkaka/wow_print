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
        width: 640,
        height: 457,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: 'https://cdn.wanqiandaikuan.com/1604024547546_lALPD3lGsDaemp_M9szA_192_246.png',
        width: 640,
        height: 338,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 58,
        height: 74.30,
        offsetX: 291,
        offsetY: 294
      }
    ]
  },
  deskCalendarPage: ({ backgroundImage, cropImage }) => {
    return [
      {
        type: 'Image',
        imageUrl: backgroundImage,
        width: 640,
        height: 457,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 251,
        height: 330,
        offsetX: 79,
        offsetY: 43
      }
    ]
  },
  deskCalendarPageHorizontal: ({ backgroundImage, cropImage }) => {
    return [
      {
        type: 'Image',
        imageUrl: backgroundImage,
        width: 640,
        height: 457,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 380,
        height: 216,
        offsetX: 79,
        offsetY: 43
      }
    ]
  },
  bookCover: ({ cropImage, bookName, description }) => {
    return [
      {
        type: 'Image',
        imageUrl: 'http://cdn.91jiekuan.com/FoXlt8UQT99Eoiuk2NJPWdrwRTIE',
        width: 640,
        height: 640,
        offsetX: 0,
        offsetY: 0
      },
      {
        type: 'Image',
        imageUrl: 'http://cdn.91jiekuan.com/FuWAks8AFr9u_OujPhO_Q8zhYydw',
        width: 178,
        height: 88,
        offsetX: 462,
        offsetY: 42
      },
      {
        type: 'Image',
        imageUrl: cropImage,
        width: 555,
        height: 472,
        offsetX: 0,
        offsetY: 168
      },
      {
        type: 'Text',
        text: bookName,
        offsetX: 44,
        offsetY: 66,
        textFontSize: 28,
        textColor: [51, 51, 51]
      },
      {
        type: 'Text',
        text: description,
        offsetX: 44,
        offsetY: 112,
        textFontSize: 14,
        textFontSize: [51, 51, 51]
      }
    ]
  },
  bookPage: ({ cropImage }) => {
    return [
      {
        imageUrl: cropImage,
        width: 320,
        height: 320,
        offsetX: 0,
        offsetY: 0
      }
    ]
  }
}

export default (type, imgInfo) => {
  return renderMap[type](imgInfo);
}
