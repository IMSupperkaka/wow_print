
export default {
    namespace: 'user',
    state: {
        info: {
            nickName: null,
            avatarUrl: null
        }
    },
    reducers: {
        saveUserInfo(state, { payload }) {
            return {
                ...state,
                info: {
                    ...state.info,
                    ...payload
                }
            }
        }
    }
}
