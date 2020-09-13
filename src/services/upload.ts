import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const uploadFile = (data) => {
    return TaroRequest.uploadFile({
        url: `${baseUrl}/upload/file`,
        name: 'file',
        ...data
    })
}
