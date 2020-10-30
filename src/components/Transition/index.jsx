import { useState } from "react";
import React, { useState, useEffect } from 'react';

const enterTimer = null;
const leaveTimer = null;

export default (props) => {

    const [state, setState] = useState('before-enter');

    useEffect(() => {

    }, [props.in])

    clearTimeout(enterTimer);
    clearTimeout(leaveTimer);

    setState('enter-active');

    setTimeout(() => {
        setState('enter-done');
    }, props.timeout);

    const CloneChildren = React.cloneElement(props.children, {
        className: state
    })

    return <CloneChildren/>;
}
