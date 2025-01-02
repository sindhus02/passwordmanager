export default class HttpHelper {

    BASE_URL = 'http://192.168.1.126:3000'

    get({url, headers}){

        return fetch(this.BASE_URL + url, {
            method: "GET",
            headers
        })
        .then(response => response.json())
        .catch(e => {alert(e); console.log(e)})

    }

    put({url, headers}){

        return fetch(this.BASE_URL + url, {
            method: "PUT",
            headers
        })
        .then(response => response.json())
        .catch(e => {alert(e); console.log(e)})

    }

    delete({url, headers}){

        return fetch(this.BASE_URL + url, {
            method: "DELETE",
            headers
        })
        .then(response => response.json())
        .catch(e => {alert(e); console.log(e)})

    }

    post({url, headers, body}){

        return fetch(this.BASE_URL + url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .catch(e => {alert(e); console.log(e)})

    }

    /*
    async addAuthToHeaders(headers){
        const auth = new AuthHelper()
        const token = await auth.getToken()

        if(token !== null){
            if(headers !== undefined) headers['x-access-token'] = token
            else {
                headers = {}
                headers['x-access-token'] = token
            }
        }
    }
    */

}
