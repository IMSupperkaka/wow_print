import { EDIT_WIDTH } from '../utils/picContent';
import { calcRotatedSize, fitImg } from '../utils/utils';

class imgView {

    constructor ({ src, width, height }) {
        this.imgInfo = {
            src,
            width,
            height
        };
    }

    crop({ translate, rotate, mirror, scale, editwidth = EDIT_WIDTH }, { contentWidth, contentHeight }) {

        const angel = rotate > 0 ? 360 - rotate : -rotate; // 转换为顺时针角度

        const { tWidth, tHeight } = fitImg({ // 依照容器宽高修正后的图片宽高
            width: this.imgInfo.width,
            height: this.imgInfo.height,
            contentWidth: contentWidth,
            contentHeight: contentHeight,
            deg: angel
        });
        
        const { resizeWidth, resizeHeight } = calcRotatedSize({ // 旋转后图片的宽高
            width: this.imgInfo.width,
            height: this.imgInfo.height
        }, angel);

        const translateScale = contentWidth / editwidth;

        const as = tWidth / this.imgInfo.width * scale;

        const cropContentWidth = Math.round(contentWidth / as);

        const cropContentHeight = Math.round(contentHeight / as);

        let x = Math.round(resizeWidth * 0.5 - cropContentWidth * 0.5 - translate[0] * translateScale / as);

        let y = Math.round(resizeHeight * 0.5 - cropContentHeight * 0.5 - translate[1] * translateScale / as);

        if (x + cropContentWidth > resizeWidth) {
            x = Math.round(resizeWidth - cropContentWidth);
        }

        if (y + cropContentHeight > resizeHeight) {
            y = Math.round(resizeHeight - cropContentHeight);
        }

        const cropUrl = `${this.imgInfo.src}?imageMogr2/rotate/${angel}/auto-orient/crop/!${cropContentWidth}x${cropContentHeight}a${x}a${y}`;

        return {
            width: cropContentWidth,
            height: cropContentHeight,
            cropUrl,
            rotate: angel,
            scale,
            flipType: mirror ? 1 : null,
            crop: {
                width: cropContentWidth,
                height: cropContentHeight,
                x: Math.max(0, x),
                y: Math.max(0, y)
            }
        }
    }
}

export default imgView;
