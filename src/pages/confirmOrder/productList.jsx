import React from 'react';
import { View, Image, Text } from '@tarojs/components';

import { fix } from '../../utils/utils';
import Step from '../../components/Step';
import styles from './product-list.module.less';
import unselectPng from '../../../images/unselect.png';
import selectedPng from '../../../images/selected.png';

const defaultRowSelection = {
  type: 'none',
  selectedRowKeys: [],
  onChange: () => {}
}

const Radio = ({ value, onChange, ...restProps }) => {
  return (
    <View className={restProps.className}>
      <Image className={styles.radio} onClick={() => { onChange(!value) }} src={value ? selectedPng : unselectPng}/>
      {restProps.children}
    </View>
  )
}

export default ({ list = [], onChange: propOnChange, rowSelection = defaultRowSelection }) => {

  const onChange = (value, key) => {
    let cloneSelectedRowKeys = [...rowSelection.selectedRowKeys];
    if (rowSelection.type == 'radio') {
      if (value) {
        cloneSelectedRowKeys = [key];
      } else {
        cloneSelectedRowKeys = [];
      }
    }
    rowSelection.onChange(cloneSelectedRowKeys);
  }

  const handleChangeNum = (index, num) => {
    const cloneList = [...list];
    cloneList[index].saleNum = num;
    propOnChange(cloneList);
  }

  return (
    list.map((product, index) => {

      const { type, selectedRowKeys } = rowSelection;

      const isSelect = selectedRowKeys.find((v) => {
        return v == product.id;
      })

      return (
        <View className={styles.productInfoContent} onClick={(value) => { onChange(!isSelect, product.id) }}>
          {
            type == 'radio' &&
            <Radio className={styles.selection} value={isSelect}/>
          }
          <Image className="product-image" mode="aspectFill" src={product.indexImage} />
          <View className="product-content">
            <View className="product-name">
              <View>
                {product.name}
              </View>
              <View>
                {product.description}
              </View>
            </View>
            <View className="product-price">
              <View>￥{fix(product.sellingPrice, 2)}</View>
              <Step value={product.saleNum} onChange={(value) => { handleChangeNum(index, value) }}/>
            </View>
          </View>
        </View>
      )
    })
  )
}
