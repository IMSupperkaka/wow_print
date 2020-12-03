/*
 * @Date: 2020-11-25 23:28:24
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 00:39:09
 * @FilePath: \wow_print\src\hooks\useCaptcha.js
 * @Description: Descrip Content
 */
import React, { useState, useRef, useEffect } from 'react';

import { loadNECaptcha } from '../utils/captcha';

export default (props) => {

    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState(60);
    const instance = useRef();
    const timer = useRef();

    useEffect(() => {
        if (timer.current && time <= 0) {
            clearInterval(timer.current);
            setTime(60);
        }
    }, [time])

    const startCount = () => {
        timer.current = setInterval(() => {
            console.log('aaa')
            setTime((time) => {
                return --time;
            })
        }, 1000);
    }

    const onClose = () => {
        instance.current.refresh();
    }

    const onVerify = (err, data) => {
        if (err) {
            return;
        }
        const result = props.onVerify({
            captchaId: props.captchaId,
            ...data
        });
        instance.current.refresh();
        if (typeof result?.then === 'function') {
            return result.then(() => {
                startCount();
            })
        }
    }

    useEffect(() => {
        setLoading(true);
        loadNECaptcha({
            captchaId: props.captchaId,
            onClose: onClose,
            onVerify: onVerify
        }).then((captcha) => {
            instance.current = captcha;
            setLoading(false);
        })
        return () => {clearInterval(timer.current)}
    }, [])

    return {
        loading,
        time,
        captcha: instance.current
    }

}
