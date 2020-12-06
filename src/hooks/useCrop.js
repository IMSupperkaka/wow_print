import React, { useEffect, useReducer, useMemo } from 'react';
import lodash from 'lodash';
import Taro from '@tarojs/taro';

import math from '../utils/math';
import { fitImg, approach, computedBlur } from '../utils/utils';

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

const buildTransformStyle = ({ animate, width, height, editwidth, contentWidth, contentHeight, mirror, rotate, translate, scale}) => {

    const approachRotate = approach([0, -90, -180, -270, -360, 90, 180, 270, 360], rotate);

    const { tWidth, tHeight } = fitImg({
        width,
        height,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        deg: approachRotate
    });

    const scalea = contentWidth / editwidth;
    // 位移矩阵
    const translateMatrix = math.matrix([[1, 0, translate[0] * scalea / radio], [0, 1, translate[1] * scalea / radio], [0, 0, 1]]);
    // 缩放矩阵
    const scaleMatrix = math.matrix([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
    // 旋转矩阵
    // a = Math.cos(deg); b = -Math.sin(deg); c = Math.sin(deg); d = Math.cos(deg); deg为旋转弧度 rotate / 180 * Math.PI
    const deg = rotate / 180 * Math.PI;
    const rotateMatrix = math.matrix([[Math.cos(deg), Math.sin(deg), 0], [-Math.sin(deg), Math.cos(deg), 0], [0, 0, 1]]);
    // 镜像矩阵
    // a = (1-k*k)/(k*k+1); b = 2k/(k*k+1); c = 2k/(k*k+1); d = (k*k-1)/(k*k+1); k为斜率
    // matrix(a,b,c,d,e,f);
    // math.matrix([[a, c, e], [b, d, f], [0, 0, 1])
    const mirrorMatrix = math.matrix([[-1, 0, 0], [0, 1, 0], [0, 0, 1]]);

    // 依次执行旋转 缩放 镜像 位移 顺序不能错
    let matrix = math.multiply(rotateMatrix, scaleMatrix);

    if (mirror) {
        matrix = math.multiply(mirrorMatrix, matrix);
    }

    matrix = math.multiply(translateMatrix, matrix)

    const transformStyle = {
        transformOrigin: '50% 50%',
        transform: `matrix(${matrix._data[0][0].toFixed(6)}, ${matrix._data[1][0].toFixed(6)}, ${matrix._data[0][1].toFixed(6)}, ${matrix._data[1][1].toFixed(6)}, ${matrix._data[0][2].toFixed(6)}, ${matrix._data[1][2].toFixed(6)})`,
        width: Taro.pxTransform(tWidth, 750),
        height: Taro.pxTransform(tHeight, 750),
        transition: animate ? 'transform .2s' : 'none'
    }

    const contentStyleMatrix =  math.multiply(translateMatrix, rotateMatrix);

    const contentStyle = {
        width: Taro.pxTransform(tWidth * scale, 750),
        height: Taro.pxTransform(tHeight * scale, 750),
        transform: `matrix(${contentStyleMatrix._data[0][0].toFixed(6)}, ${contentStyleMatrix._data[1][0].toFixed(6)}, ${contentStyleMatrix._data[0][1].toFixed(6)}, ${contentStyleMatrix._data[1][1].toFixed(6)}, ${contentStyleMatrix._data[0][2].toFixed(6)}, ${contentStyleMatrix._data[1][2].toFixed(6)})`,
        transition: animate ? 'all .2s' : 'none',
    }

    return {
        contentStyle,
        transformStyle
    };
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

export default (props = {}) => {

    const { forcefit = false } = props;

    const [state, dispatch] = useReducer(cropReducer, {
        store: {
            behavior: ['translate']
        },
        mirror: false,
        rotate: 0,
        scale: 1,
        translate: [0, 0],
        isTouch: false,
        isMoving: false,
        animate: false,
        lastTouch: [],
        editwidth: props.editwidth || props.contentWidth,
        width: props.width || 0,
        height: props.height || 0,
        contentWidth: props.contentWidth || 0,
        contentHeight: props.contentHeight || 0,
        ...props
    })

    const {
        width,
        height,
        contentWidth,
        contentHeight,
        editwidth,
        translate,
        scale,
        rotate,
        mirror,
        store,
        isTouch,
        isMoving,
        animate,
        lastTouch
    } = state;

    useEffect(() => {
      const approachRotate = approach([0, -90, -180, -270, -360, 90, 180, 270, 360], rotate);
      const { fWidth, fHeight } = fitImg({
          width,
          height,
          contentWidth: contentWidth,
          contentHeight: contentHeight,
          deg: approachRotate
      });
      const blur = computedBlur({
          contentWidth: contentWidth,
          contentHeight: contentHeight,
          width: width,
          height: height,
          afterWidth: fWidth * scale,
          afterHieght: fHeight * scale,
          printWidth: 10,
          printHeight: 10 / (width / height)
      });
      console.log(blur)
      dispatch({
          type: 'save',
          payload: {
            blur
          }
      })
    }, [width, height, contentWidth, contentHeight, scale, rotate])

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
                animate: false,
                isTouch: true,
                lastTouch: nowlastTouch
            }
        })
        dispatch({
            type: 'saveStore',
            payload: {
                behavior: e.target.dataset.behavior || e.target['data-behavior'] || ['translate'],
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
                    rotate: mirror ? store.originDeg + deg : store.originDeg - deg,
                    isMoving: true
                }
            })
        } else {
            let payload = {
              isMoving: true
            };
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

        if (!isMoving) {
          return;
        }

        let payload = {
            isTouch: false,
            isMoving: false,
            scale: scale,
            animate: true
        }

        if (state.editwidth || state.contentWidth) {
            payload.editwidth = state.editwidth || state.contentWidth;
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
            editwidth,
            ...payload
        });

        dispatch({
            type: 'save',
            payload: payload
        })

    }

    const style = buildTransformStyle(state);

    return {
        state: state,
        touchProps: {
            onTouchMove: touchMove,
            onTouchEnd: touchEnd,
            onTouchStart: touchStart
        },
        cropProps: {
          useProps: true,
          transformStyle: style.transformStyle,
          width: width,
          height: height,
          contentWidth: contentWidth,
          contentHeight: contentHeight,
          ignoreBlur: true,
          cropOption: {
            rotate,
            translate,
            scale,
            mirror,
            editwidth: editwidth
          },
          animate: animate
        },
        style: style,
        mutate: (state) => {
            let payload = state;
            if (state.editwidth || state.contentWidth) {
                payload.editwidth = state.editwidth || state.contentWidth
            }
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
            props.onFinish && props.onFinish({
                translate, scale, rotate, mirror, isTouch,
                editwidth,
                ...payload
            });
            dispatch({
                type: 'save',
                payload: payload
            })
        }
    }
}
