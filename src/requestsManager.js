import { Axios } from 'axios'



export default class RequestsManager {

    constructor() {
        this.axios = new Axios({
            baseURL: "../",
            headers: {
                'Access-Control-Allow-Origin': 'file:',
            }
        });
    }

    getNetwork(name) {
        return this.axios.get('/data/'+name, {
            params: {}
        })
        .then((response) => {
             return response.data;
        });
    }

    getAllFileNames(){
        let name = "dataList.json";
        
        return this.axios.get('/data/'+name, {
            params: {}
        })
        .then((response) => {
             return response.data;
        });
    }
}