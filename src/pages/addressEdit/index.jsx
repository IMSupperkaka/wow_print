import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Input, Switch, Picker, Text } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import Cell from '../../components/Cell';

import './index.less';
import wechatIcon from '../../../images/icon_wechat@2x.png';
import { add, edit, detail, del } from '../../services/address';
import { useEffect } from 'react';

export default () => {

    const [query, setQuery] = useState({});

    const [form, setForm] = useState({
        recipient: '',
        phone: '',
        region: [],
        address: '',
        isDefault: false
    });

    const onGetAddress = (e) => {
        Taro.chooseAddress({
            success: (result) => {
                setForm({
                    ...form,
                    recipient: result.userName,
                    phone: result.telNumber,
                    region: [result.provinceName, result.cityName, result.countyName],
                    address: result.detailInfo,
                })
            }
        })
    }

    useEffect(() => {
        const query = Taro.getCurrentInstance().router.params;
        setQuery(query);
        Taro.setNavigationBarTitle({
            title: query.type == 'add' ? '添加收货地址' : '编辑收货地址'
        });
        if (query.type == 'edit') {
            detail({
                addressId: query.id
            }).then(({ data }) => {
                setForm({
                    recipient: data.data.recipient,
                    phone: data.data.phone,
                    region: [data.data.province, data.data.city, data.data.area],
                    address: data.data.address,
                    isDefault: data.data.isDefault
                })
            })
        }
    }, [])

    const handleSave = () => {
        const query = Taro.getCurrentInstance().router.params;
        if (query.type == 'add') {
            add({
                recipient: form.recipient,
                phone: form.phone,
                province: form.region[0],
                city: form.region[1],
                area: form.region[2],
                address: form.address,
                isDefault: form.isDefault ? 1 : 0
            }).then(() => {
                if (query.redirect) {
                    Taro.redirectTo({
                        url: decodeURIComponent(query.redirect)
                    })
                } else {
                    Taro.navigateBack();
                }
            })
        } else {
            edit({
                id: query.id,
                recipient: form.recipient,
                phone: form.phone,
                province: form.region[0],
                city: form.region[1],
                area: form.region[2],
                address: form.address,
                isDefault: form.isDefault ? 1 : 0
            }).then(() => {
                if (query.redirect) {
                    Taro.redirectTo({
                        url: decodeURIComponent(query.redirect)
                    })
                } else {
                    Taro.navigateBack();
                }
            })
        }
    }

    const onChange = (e) => {
        setForm({
            ...form,
            region: e.detail.value
        })
    }

    const handleDelete = () => {
        Taro.showModal({
            title: '确定删除',
            content: '是否删除该地址',
            confirmText: '确定',
            cancelText: '取消',
            confirmColor: '#FF6345',
            success: (res) => {
                if (res.confirm) {
                    del(query.id).then(() => {
                        Taro.navigateBack();
                    })
                }
            }
        })
    }

    const isValid = form.recipient && form.phone && form.region.length > 0 && form.address;

    return (
        <View>
            <View className="address-wrap">
                <Cell>
                    <Input
                        className="cell-input"
                        name='recipient'
                        type='text'
                        maxLength={10}
                        placeholder='收件人'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        value={form.recipient}
                        onInput={(event) => {
                            setForm({
                                ...form,
                                recipient: event.detail.value
                            })
                        }}
                    />
                </Cell>
                <Cell>
                    <Input
                        className="cell-input"
                        name='phone'
                        type='number'
                        maxLength={11}
                        placeholder='手机号码'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        value={form.phone}
                        onInput={(event) => {
                            setForm({
                                ...form,
                                phone: event.detail.value
                            })
                        }}
                    />
                </Cell>
                <Picker value={form.region} mode='region' onChange={onChange}>
                    <Cell title={
                        form.region.length > 0 ?
                        form.region.join('') :
                        <Text>所在地区</Text>
                    } isLink/>
                </Picker>
                <Cell>
                    <Input
                        className="cell-input"
                        name='address'
                        type='text'
                        maxLength={50}
                        placeholder='详细地址：如街道门牌、楼层房间等信息'
                        adjustPosition={true}
                        placeholderStyle="color: #C1C1C1"
                        value={form.address}
                        onInput={(event) => {
                            setForm({
                                ...form,
                                address: event.detail.value
                            })
                        }}
                    />
                </Cell>
            </View>
            <Cell className="set-default" title="设为默认地址">
                <Switch className="switch" color="#FF6345" checked={form.isDefault} onChange={(event) => {
                    setForm({
                        ...form,
                        isDefault: event.detail.value
                    })
                }}/>
            </Cell>
            {
                query.type == 'edit' &&
                <Cell onClick={handleDelete} className="delete-address" title="删除该收获地址"/>
            }
            <AtButton disabled={!isValid} className="save-btn" type="primary" onClick={handleSave}>保存并使用</AtButton>
            <AtButton className="use-wx-location" type="primary" onClick={onGetAddress}>
              <Image className="wechat-icon" src={wechatIcon}/>
              使用微信地址
            </AtButton>
        </View>
    )
}
