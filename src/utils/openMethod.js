import Taro from '@tarojs/taro';

export const getSetting = (scope, { success }) => {
    Taro.getSetting({
        success: function (res) {
            if (!res.authSetting[scope]) {
                return Taro.openSetting({
                    success: ({ authSetting }) => {
                        if (authSetting[scope]) {
                            success && success();
                        }
                    }
                });
            }
            success && success();
        }
    })
}