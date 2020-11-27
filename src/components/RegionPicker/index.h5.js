import React, { useState, useEffect } from 'react';
import area from './area';
import { Picker } from '@tarojs/components';

const allRange = [
    area.province_list,
    area.city_list,
    area.county_list
]

const getCityByProvince = (provinceName) => {
    const provinceKey = Object.keys(area.province_list).find((key) => {
        return area.province_list[key] == provinceName;
    })
    let cityList = [];
    Object.keys(area.city_list).map((key) => {
        if (String(provinceKey).substr(0, 2) == String(key).substr(0, 2)) {
            cityList.push(area.city_list[key]);
        }
    })
    return cityList;
}

const getCountyByCity = (cityName) => {
    const cityKey = Object.keys(area.city_list).find((key) => {
        return area.city_list[key] == cityName;
    })
    let countyList = [];
    Object.keys(area.county_list).map((key) => {
        if (String(cityKey).substr(0, 4) == String(key).substr(0, 4)) {
            countyList.push(area.county_list[key]);
        }
    })
    return countyList;
}

const provinceNameList = Object.values(area.province_list);

const defaultRange = [
    provinceNameList,
    getCityByProvince('北京市'),
    getCountyByCity('北京市')
]

export default (props) => {

    const [value, setValue] = useState([0, 0, 0]);

    const [range, setRange] = useState(defaultRange);

    useEffect(() => {
        const cityNameList = getCityByProvince(props.value[0] || provinceNameList[0]);
        const countyNameList = getCountyByCity(cityNameList[0]);
        setValue([
            provinceNameList.findIndex(v => (v == props.value[0])),
            cityNameList.findIndex(v => (v == props.value[1])),
            countyNameList.findIndex(v => (v == props.value[2]))
        ]);
        setRange([
            provinceNameList,
            cityNameList,
            countyNameList
        ])
    }, [props.value])

    const onChange = (e) => {
        props.onChange({
            detail: {
                value: [
                    range[0][e.detail.value[0]],
                    range[1][e.detail.value[1]],
                    range[2][e.detail.value[2]],
                ]
            }
        });
    }

    const onColumnChange = (e) => {
        if (e.detail.column == 0) {
            const cityNameList = getCityByProvince(provinceNameList[e.detail.value]);
            setValue([e.detail.value, 0, 0]);
            setRange([
                provinceNameList,
                cityNameList,
                getCountyByCity(cityNameList[0])
            ])
        } else if (e.detail.column == 1) {
            setRange((range) => {
                return [
                    range[0],
                    range[1],
                    getCountyByCity(range[1][e.detail.value])
                ]
            })
            setValue((value) => {
                return [
                    value[0],
                    e.detail.value,
                    0
                ]
            });
        }
    }

    return (
        <Picker mode='multiSelector' range={range} onColumnChange={onColumnChange} onChange={onChange} value={value}>{ props.children }</Picker>
    );
};
