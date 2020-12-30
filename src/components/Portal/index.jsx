import React from 'react'
import { createPortal } from 'react-dom'

export default (props) => {
    const { getContainer } = props;

    let children = props.children;

    if (typeof getContainer === 'function') {
        const node = getContainer();
        if (node) {
            children = createPortal(props.children, node);
        }
    }

    return children;
}
