import Taro from '@tarojs/taro';

export default async ({ canvasId, filePath, width, height }) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (Math.max(width, height) > 2000) {
            if (width > height) {
                canvas.width = 2000;
                canvas.height = 2000 / (width / height);
            } else {
                canvas.width = 2000 * (width / height);
                canvas.height = 2000;
            }
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        
        let img = new Image();
        img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL(`image/jpeg`, 1);
            const res = {
                tempFilePath: dataURL,
                res: 'canvasToTempFilePath:ok'
            };
            return resolve(res.tempFilePath);
        }
        img.onerror = (err) => {
            console.log(err)
        }
        img.src = filePath;
    })
}