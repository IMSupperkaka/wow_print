import TaroRequest from '../utils/request'

export const uploadFile = (data) => {
    return TaroRequest.uploadFile({
        url: `/upload/file`,
        name: 'file',
        ...data
    })
}
