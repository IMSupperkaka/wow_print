import { useState } from 'react';
import useUpdateEffect from './useUpdateEffect';

export default (initialValue) => {
    const [state, setState] = useState(initialValue);
    useUpdateEffect(() => {
        setState(initialValue);
    }, [initialValue])
    return [state, setState]
}