/*
 * @Date: 2020-11-01 21:13:59
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-01 22:30:18
 * @FilePath: \wow_print\src\utils\synthesis.js
 * @Description: Descrip Content
 */

const renderMap = {
    deskCalendarCover: ({ backgroundImage, cropImage, title }) => {
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
                width: 2216,
                height: 1180,
                offsetX: 172,
                offsetY: 172
            },
            {
                type: 'Text',
                text: title,
                textFontFamily: "微软雅黑",
                offsetY: 1432,
                textFontSize: 72,
                textAlignCenter: true,
                textColor: [102, 102, 102]
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
    bookCover: ({ cropImage, bookName, description, date }) => {
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
                offsetX: 1600,
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
                textFontFamily: "微软雅黑",
                offsetX: 176,
                offsetY: 264,
                textFontSize: 112,
                textColor: [51, 51, 51]
            },
            {
                type: 'Text',
                text: description,
                textFontFamily: "微软雅黑",
                offsetX: 176,
                offsetY: 448,
                textFontSize: 56,
                textColor: [51, 51, 51]
            },
            {
                type: 'Image',
                imageUrl: 'https://cdn.91daiwo.com/back.png',
                width: 312,
                height: 76,
                offsetX: 2064,
                offsetY: 2244
            },
            {
                type: 'Text',
                text: date,
                textFontFamily: "微软雅黑",
                offsetX: 2090,
                offsetY: 2250,
                textFontSize: 48,
                textColor: [255, 255, 255]
            }
        ]
    },
    bookPage: ({ cropImage }) => {
        return [
            {
                type: 'Image',
                imageUrl: cropImage,
                width: 2560,
                height: 2628,
                offsetX: 0,
                offsetY: 0
            }
        ]
    }
}

export default (type, imgInfo) => {
    return renderMap[type](imgInfo);
}
