const fileInfo = {
    fileWidth: 520,
    fileHeight: 434,
    x: 0,
    y: 0
}

export default [
    {
        name: "原图定制",
        stageInfo: {
            width: 586,
            height: 509,
            bgPath: 'http://cdn.91jiekuan.com/Fu5S1YAf5yN0wF8Up49GE3GKnQPs',
            bgCover: false,
            mixBlendMode: 'normal',
            maskPath: 'http://cdn.91jiekuan.com/Frp2ttsFNf_VIJBgMdEvaQWCHKE_',
            thumbnail: 'http://cdn.91jiekuan.com/Fru-pa8Jk2dyXIYhbM5pvxLHZPSY',
        },
        fileInfo: {
            ...fileInfo
        },
        editArea: [
            {
                x: 33, // 距离底图(带阴影的背景图)的left
                y: 9, // 距离底图(带阴影的背景图)的top
                fileX: 0, // 距离filePath模板的left
                fileY: 0, // 距离filePath模板的top
                width: 520,
                height: 434,
            }
        ]
    }
]
