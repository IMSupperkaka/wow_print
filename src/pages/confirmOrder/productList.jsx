import React from 'react';
import lodash from 'lodash';
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';

import { fix } from '../../utils/utils';
import Step from '../../components/Step';
import styles from './product-list.module.less';
import unselectPng from '../../../images/unselect.png';
import selectedPng from '../../../images/selected.png';

const defaultRowSelection = {
    type: 'none',
    selectedRowKeys: [],
    onChange: () => { }
}

const Radio = ({ value, onChange, ...restProps }) => {
    return (
        <View className={restProps.className}>
            <Image className={styles.radio} onClick={() => { onChange(!value) }} src={value ? selectedPng : unselectPng} />
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
        if (rowSelection.type == 'checkbox') {
            if (value) {
                cloneSelectedRowKeys.push(key);
            } else {
                cloneSelectedRowKeys = lodash.pullAll(cloneSelectedRowKeys, [key])
            }
        }
        rowSelection.onChange(lodash.uniq(cloneSelectedRowKeys));
    }

    const handleChangeNum = (index, num) => {
        const cloneList = [...list];
        cloneList[index].saleNum = num;
        propOnChange(cloneList);
    }

    const handleGoDetail = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        Taro.navigateTo({
            url: `/pages/productDetail/index?id=${product.id}&type=display`
        })
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
                        (type == 'radio' || type == 'checkbox') &&
                        <Radio className={styles.selection} value={isSelect} />
                    }
                    <Image onClick={(e) => { handleGoDetail(e, product) }} className="product-image" mode="aspectFill" src={product.indexImage} />
                    <View className="product-content">
                        <View className="product-name">
                            <View className="product-name-item">
                                {product.name}
                            </View>
                            <View className="product-name-item">
                                {product.description}
                            </View>
                        </View>
                        <View className="product-price">
                            <View>￥{fix(product.sellingPrice, 2)}</View>
                            <Step value={product.saleNum} max={product.stock == null ? Infinity : product.stock} onChange={(value) => { handleChangeNum(index, value) }} />
                        </View>
                    </View>
                </View>
            )
        })
    )
}
