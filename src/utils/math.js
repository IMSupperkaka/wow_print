import { create, chainDependencies, subtractDependencies, matrixDependencies, multiplyDependencies, addDependencies, divideDependencies, } from 'mathjs';

const math = create({
    chainDependencies,
    addDependencies,
    subtractDependencies,
    divideDependencies,
    matrixDependencies,
    multiplyDependencies
}, {})

export default math;
