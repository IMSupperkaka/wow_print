import { calcRotatedSize } from '../utils/utils';

class imgView {

    constructor ({ src, width, height }) {
        this.imgInfo = {
            src,
            width,
            height
        };
    }

    crop({ translate, rotate, mirror, scale }, { contentWidth, contentHeight }) {
        
        const angel = rotate > 0 ? 360 - rotate : -rotate; // 转换为顺时针角度

        const { resizeWidth, resizeHeight } = calcRotatedSize({ // 旋转后图片的宽高
            width: this.imgInfo.width,
            height: this.imgInfo.height
        }, angel);

        const 

        const x = resizeWidth * scale * 0.5 - contentWidth * 0.5 - 

        return {
            rotate: angel,
            scale,
            mirror,
            crop: {
                width: contentWidth,
                height: contentHeight,
                x: 0,
                y: 0
            }
        }
    }
}