
export default {
    reducers: {
        save(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    }
}
