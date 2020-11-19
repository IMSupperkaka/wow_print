export const orderStatus = new Map([
    [1, '待付款'],
    [2, '待发货'],
    [3, '待收货'],
    [4, '已取消'],
    [5, '已退款'],
    [9, '已收货'],
    // TODO:新增已关闭
    [9, '已关闭']
])

export const sizeMap = new Map([
  [3, 0.697],
  [4, 0.745],
  [5, 0.700],
  [6, 0.667]
])
