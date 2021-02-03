import { useState, useEffect } from 'react';
import uniqueId from 'lodash/uniqueId';

export default (props) => {

    const [id, setId] = useState(null);

    useEffect(() => {
        setId(uniqueId(props.prefix));
    }, [])

    return {
        id
    }
}
