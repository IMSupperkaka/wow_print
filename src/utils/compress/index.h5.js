import Taro from '@tarojs/taro';

export default ({ canvasId, filePath, width, height }) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        let img = new Image();
        img.src = filePath;
        img.onload = () => {
            context.drawImage(img, 0, 0, width, height)
            const dataURL = canvas.toDataURL(`image/jpeg`, 0.5);
            const res = {
                tempFilePath: dataURL,
                res: 'canvasToTempFilePath:ok'
            };
            return resolve(res.tempFilePath);
        }
    })
}