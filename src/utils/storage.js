
export const sessionStorage = {
    setItem () {
        if (process.env.TARO_ENV === 'h5') {
            return window.sessionStorage.setItem(...arguments);
        }
        return null;
    },
    getItem() {
        if (process.env.TARO_ENV === 'h5') {
            return window.sessionStorage.getItem(...arguments);
        }
        return null;
    }
}