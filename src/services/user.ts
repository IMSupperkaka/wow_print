import TaroRequest from '../utils/request'

const baseUrl = 'https://testapp.wayinkeji.com';

export const login = async (code) => {
    return TaroRequest.request({
        url: `${baseUrl}/app/user/login/${code}`,
        method: 'POST'
    });
}
