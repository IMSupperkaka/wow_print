import React from 'react';
import classNames from 'classnames';
import { Button } from '@tarojs/components';

import './index.less';

export default (props) => {
    return (
        <Button {...props} className={classNames('wy-button', props.className)} onClick={(e) => { !props.disabled && props?.onClick(e) }}>
            {
                props.children
            }
        </Button>
    )
}
