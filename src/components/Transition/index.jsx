import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

let enterTimer = null;
let leaveTimer = null;

export default (props) => {

    const [state, setState] = useState(null);

    useEffect(() => {
        if (props.in) {
            clearTimeout(enterTimer);
            clearTimeout(leaveTimer);
            setState('enter');
            setTimeout(() => {
                setState('enter-active');
            }, 0)
            enterTimer = setTimeout(() => {
                setState('enter-done');
            }, props.timeout);
        } else {
            if (state == null) {
                return;
            }
            clearTimeout(enterTimer);
            clearTimeout(leaveTimer);
            setState('exit');
            setTimeout(() => {
                setState('exit-active');
            }, 0)
            leaveTimer = setTimeout(() => {
                setState('exit-done');
            }, props.timeout);
        }
    }, [props.in])

    if (!props.in && (!state || state == 'exit-done')) {
        return null;
    }

    const CloneChildren = React.cloneElement(props.children, {
        className: classNames(props.children.props.className, props.classNames + '-' + state)
    })

    return CloneChildren;
}
