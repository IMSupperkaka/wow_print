import { useState, useEffect } from 'react';
import uniqueId from 'lodash/fp/uniqueId';

export default (props) => {

    const [id, setId] = useState(null);

    useEffect(() => {
        setId(uniqueId(props.prefix));
    }, [])

    return {
        id
    }
}
