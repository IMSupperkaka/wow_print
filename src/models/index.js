import modelExtend from 'dva-model-extend';

import base from './base.js';
import user from './user.models.js';

const models = [
    user
]

export default models.map((model) => {
    return modelExtend(base, model);
})
