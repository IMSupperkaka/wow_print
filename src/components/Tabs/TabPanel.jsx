import React, { useState, useEffect } from 'react';

export default (props) => {

    const { active, node, forceRender } = props;

    const [visited, setVisited] = useState(forceRender);

    useEffect(() => {
        if (active) {
            setVisited(true)
        }
    }, [active])

    return (
        (forceRender || visited || active) && node
    );
}
