export default {
    pages: [
        'pages/home/index',
        'pages/coupon/index',
        'pages/couponList/index',
        'pages/my/index',
        'pages/authInfo/index',
        'pages/productDetail/index',
        'pages/addressList/index',
        'pages/addressEdit/index',
        'pages/myOrder/index'
    ],
    tabBar: {
        color: '#666666',
        selectedColor: '#FF6345',
        borderStyle: 'white',
        list: [
            {
                pagePath: 'pages/home/index',
                iconPath: 'images/tab_icon_home_default@2x.png',
                selectedIconPath: 'images/tab_icon_home_pressed@2x.png',
                text: '首页'
            },
            {
                pagePath: 'pages/coupon/index',
                iconPath: 'images/tab_icon_coupons_default@2x.png',
                selectedIconPath: 'images/tab_icon_coupons_pressed@2x.png',
                text: '优惠券'
            },
            {
                pagePath: 'pages/my/index',
                iconPath: 'images/tab_icon_my_default@2x.png',
                selectedIconPath: 'images/tab_icon_my_pressed@2x.png',
                text: '我的'
            }
        ]
    },
    window: {
        navigationBarBackgroundColor: '#fff',
        navigationBarTextStyle: 'black',
        backgroundColor: '#F6F6F6'
    },
}
