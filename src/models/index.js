import modelExtend from 'dva-model-extend';

import base from './base.js';
import user from './user.models.js';
import confirmOrder from './confirmOrder.model.js';

const models = [
    user,
    confirmOrder
]

export default models.map((model) => {
    return modelExtend(base, model);
})
