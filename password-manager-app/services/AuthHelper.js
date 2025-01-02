import HttpHelper from './HttpHelper';
import { SecureStore } from 'expo';

export default class AuthHelper {
    static instance
    static user

    static getInstance() {
        if (AuthHelper.instance == null) {
            AuthHelper.instance = new AuthHelper()
        }
        return AuthHelper.instance
    }

    async login(email, password) {
        return new Promise(async (resolve, reject) => {
            const http = new HttpHelper()
            const url = '/user/login'
            const headers = {email, password}
            http.put({url, headers})
                .then(async response => {
                    if(response.status == 401) {
                        reject(response.message)
                    } else {
                        await SecureStore.setItemAsync('token', response.token)
                        await SecureStore.setItemAsync('id', response.id)
                        AuthHelper.user = response
                        resolve(response)
                    }
                })
                .catch(e => reject(e))
        })
    }   

    getToken() {
        return new Promise(async (resolve, reject) => {
            if(AuthHelper.user == undefined || AuthHelper.user == null){
                let token = await SecureStore.getItemAsync('token')
                resolve(token)
            } else {
                resolve(AuthHelper.user.token)
            }
        })
    }

    async setAuth(token, id){
        await SecureStore.setItemAsync('token', token)
        await SecureStore.setItemAsync('id', id)
    }

    logout(){
        AuthHelper.user = null
        SecureStore.deleteItemAsync('token')
        return SecureStore.deleteItemAsync('id')
    }

}
