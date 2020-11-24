import React, { useEffect, useReducer } from 'react';
import Taro from '@tarojs/taro';

import math from '../utils/math';
import { fitImg, approach } from '../utils/utils';

const radio = 750 / Taro.getSystemInfoSync().screenWidth;

const getTouchPosition = (touch) => {
    return {
        x: touch.x || touch.pageX || 0,
        y: touch.y || touch.pageY || 0,
    }
}

const getTouchsPosition = (touchs) => {
    let poristionList = [];
    for (let i = 0; i < touchs.length; i++) {
        poristionList.push(getTouchPosition(touchs[i]))
    }
    return poristionList;
}

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

const getDeg = (startTouches, endTouches) => {
    const starth = startTouches[1].y - startTouches[0].y;
    const startw = startTouches[1].x - startTouches[0].x;
    const endh = endTouches[1].y - endTouches[0].y;
    const endw = endTouches[1].x - endTouches[0].x;
    let startDeg = Math.atan(starth / startw);
    let endDeg = Math.atan(endh / endw);
    if (startw < 0) {
        startDeg = startDeg - Math.PI;
    }
    if (endw < 0) {
        endDeg = endDeg - Math.PI;
    }
    return (endDeg - startDeg) / ( 2 * Math.PI) * 360;
}

const resetPosition = ({ width, height, contentWidth, contentHeight, scale, translate, rotate }) => {

    let resetx = translate[0];
    let resety = translate[1];
    let resetRotate = approach([0,-90,-180,-270,-360,90,180,270,360], rotate) % 360;

    const { fWidth, fHeight } = fitImg({
        width,
        height,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        deg: resetRotate
    })

    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    const translateMatrix = math.matrix([[1, 0, translate[0]], [0, 1, translate[1]], [0, 0, 1]]);

    // 中心点坐标
    const centerPosition = math.matrix([0, 0, 1]);
    // 操作后中心点坐标
    const afterCenterPosition = math.multiply(translateMatrix, scaleMatrix, centerPosition);

    const limit = {
        x: (fWidth * scale - contentWidth) / 2,
        y: (fHeight * scale - contentHeight) / 2
    }

    if (Math.abs(afterCenterPosition._data[0]) > limit.x) {
        resetx = (afterCenterPosition._data[0] > 0 ? 1 : -1) * limit.x;
    }

    if (Math.abs(afterCenterPosition._data[1]) > limit.y) {
        resety = (afterCenterPosition._data[1] > 0 ? 1 : -1) * limit.y;
    }
    return {
        resetx,
        resety,
        resetRotate
    }
}

const cropReducer = (state, action) => {
    switch (action.type) {
        case 'saveStore': 
            return {
                ...state,
                store: {
                    ...state.store,
                    ...action.payload
                }
            }
        case 'save':
            return {
                ...state,
                ...action.payload
            }
    }
}

export default (props) => {

    const { forcefit = false } = props;

    const [{
        translate,
        scale,
        rotate,
        mirror,
        store,
        isTouch,
        lastTouch,
        width,
        height,
        contentWidth,
        contentHeight
    }, dispatch] = useReducer(cropReducer, {
        store: {
            behavior: ['translate']
        },
        mirror: false,
        rotate: 0,
        scale: 1,
        translate: [0, 0],
        isTouch: false,
        lastTouch: [],
        width: props.width || 0,
        height: props.height || 0,
        contentWidth: props.contentWidth || 0,
        contentHeight: props.contentHeight || 0
    })

    const touchStart = (e) => {
        const nowlastTouch = getTouchsPosition(e.touches);
        const { tWidth, tHeight } = fitImg({
            width,
            height,
            contentWidth: contentWidth,
            contentHeight: contentHeight,
            deg: rotate
        })
        const arc = Math.atan(tWidth / tHeight) - rotate / 360 * 2 * Math.PI;
        const centerPoint = [{
            x: nowlastTouch[0].x - Math.sqrt(Math.pow(tWidth / radio, 2) + Math.pow(tHeight / radio, 2)) / 2 * Math.sin(arc),
            y: nowlastTouch[0].y + Math.sqrt(Math.pow(tWidth / radio, 2) + Math.pow(tHeight / radio, 2)) / 2 * Math.cos(arc)
        }];
        dispatch({
            type: 'save',
            payload: {
                isTouch: true,
                lastTouch: nowlastTouch
            }
        })
        dispatch({
            type: 'saveStore',
            payload: {
                behavior: e.target.dataset.behavior || ['translate'],
                originTranslate: translate,
                originDeg: rotate,
                originScale: scale,
                hypotenuse: nowlastTouch.length >= 2 ? getDistance(nowlastTouch[0], nowlastTouch[1]) : getDistance(nowlastTouch[0], centerPoint[0]),
                centerPoint
            }
        })
    }

    const touchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const touchPositionList = getTouchsPosition(e.touches)
        if (touchPositionList.length >= 2) { // 双指
            const hypotenuse = getDistance(touchPositionList[0], touchPositionList[1]);
            const newScale = store.originScale * (hypotenuse / store.hypotenuse);
            // 反三角函数计算弧度
            const deg = getDeg(lastTouch, touchPositionList) % 360;
            dispatch({
                type: 'save',
                payload: {
                    scale: newScale,
                    rotate: mirror ? store.originDeg + deg : store.originDeg - deg
                }
            })
        } else {
            let payload = {};
            if (store.behavior.includes('translate')) {
                const dx = (touchPositionList[0].x - lastTouch[0].x) * radio;
                const dy = (touchPositionList[0].y - lastTouch[0].y) * radio;
                payload.translate = [store.originTranslate[0] + dx, store.originTranslate[1] + dy];
            }
            if (store.behavior.includes('rotate')) {
                const deg = getDeg([...store.centerPoint, ...lastTouch], [...store.centerPoint, ...touchPositionList]) % 360;
                payload.rotate = mirror ? store.originDeg + deg : store.originDeg - deg;
            }
            if (store.behavior.includes('zoom')) {
                const hypotenuse = getDistance(touchPositionList[0], store.centerPoint[0]);
                const newScale = store.originScale * (hypotenuse / store.hypotenuse);
                payload.scale = newScale;
            }
            dispatch({
                type: 'save',
                payload: payload
            })
        }
    }

    const touchEnd = (e) => {

        let payload = {
            isTouch: false,
            scale: scale
        }

        if (scale < 1) {
            payload.scale = 1;
            Taro.vibrateShort();
        }

        if (scale > 3) {
            payload.scale = 3;
            Taro.vibrateShort();
        }

        if (forcefit) {
            const { resetx, resety, resetRotate } = resetPosition({
                width,
                height,
                contentWidth,
                contentHeight,
                translate,
                rotate,
                scale: payload.scale
            });
            if (forcefit.includes('translate')) {
                payload.translate = [resetx, resety];
            }
            if (forcefit.includes('rotate')) {
                payload.rotate = resetRotate;
            }
        }

        props.onFinish && props.onFinish({
            translate, scale, rotate, mirror, isTouch,
            ...payload
        });

        dispatch({
            type: 'save',
            payload: payload
        })
    }

    return {
        state: {
            translate,
            scale,
            rotate,
            mirror,
            store,
            isTouch,
            lastTouch
        },
        touchProps: {
            onTouchMove: touchMove,
            onTouchEnd: touchEnd,
            onTouchStart: touchStart
        },
        mutate: (state) => {
            let payload = state;
            if (forcefit) {
                const { resetx, resety, resetRotate } = resetPosition({
                    width,
                    height,
                    contentWidth,
                    contentHeight,
                    translate,
                    rotate,
                    scale,
                    ...state
                });
                if (forcefit.includes('translate')) {
                    payload.translate = [resetx, resety];
                }
                if (forcefit.includes('rotate')) {
                    payload.rotate = resetRotate;
                }
            }
            dispatch({
                type: 'save',
                payload: payload
            })
        }
    }
}
