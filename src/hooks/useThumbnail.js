import Taro from '@tarojs/taro';

export const thumbnail = (src) => {
    return `${src}?imageMogr2/auto-orient/format/jpg/thumbnail/!540x540r/quality/80!/interlace/1/ignore-error/1`;
}

export default (src) => {
    return thumbnail(src);
}
