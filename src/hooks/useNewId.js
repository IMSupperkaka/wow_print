import { useState, useEffect } from 'react';
import lodash from 'lodash';

export default (props) => {

    const [id, setId] = useState(null);

    useEffect(() => {
        setId(lodash.uniqueId(props.prefix));
    }, [])

    return {
        id
    }
}
