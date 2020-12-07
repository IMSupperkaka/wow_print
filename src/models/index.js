import modelExtend from 'dva-model-extend';

import base from './base.js';
import user from './user.models.js';
import home from './home.models.js';
import confirmOrder from './confirmOrder.model.js';
import editimg from './editimg.model.js';
import pay from './pay.model.js';

const models = [
    user,
    home,
    confirmOrder,
    editimg,
    pay
]

export default models.map((model) => {
    return modelExtend(base, model);
})
