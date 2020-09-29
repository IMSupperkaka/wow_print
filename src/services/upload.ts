import TaroRequest from '../utils/request'

export const uploadFile = (data) => {
    return TaroRequest.uploadFile({
        name: 'file',
        ...data
    })
}

export const getUploadToken = () => {
    return TaroRequest.request({
        url: `/upload/getUploadToken`,
        method: 'GET'
    })
}
