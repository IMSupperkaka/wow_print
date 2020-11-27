

let pages = [
    'pages/home/index',
    'pages/coupon/index',
    'pages/couponList/index',
    'pages/my/index',
    'pages/productDetail/index',
    'pages/addressList/index',
    'pages/addressEdit/index',
    'pages/myOrder/index',
    'pages/orderDetail/index',
    'pages/result/index',
    'pages/service/index',
    'pages/selectPic/index',
    'pages/selectBook/index',
    'pages/imgEdit/index',
    'pages/confirmOrder/index',
    'pages/webview/index',
    'pages/preview/index',
    'pages/logisticsDetails/index',
    'pages/portfolio/index',
    'pages/deskCalendar/index',
    'pages/xdPromote/index'
]

if (process.env.TARO_ENV === 'weapp') {
    pages.push('pages/authInfo/index')
}

if (process.env.TARO_ENV === 'h5') {
    pages.push('pages/login/index')
}

export default {
    pages: pages,
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
    subPackages: [
        {
            root: 'package-main-order',
            name: 'main-order',
            pages: [
                'pages/stageView/index'
            ]
        }
    ],
    window: {
        navigationBarBackgroundColor: '#fff',
        navigationBarTextStyle: 'black',
        backgroundColor: '#F6F6F6'
    },
}
