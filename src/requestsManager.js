import { Axios } from 'axios'



export default class RequestsManager {

    constructor() {
        this.axios = new Axios({
            baseURL: "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/main/data/",
        });
    }

    getNetwork(name) {
        return this.axios.get('./'+name, {
            params: {}
        })
        .then((response) => {
             return response.data;
        });
    }

    getAllFileNames(){
        let name = "dataList.json";
        
        return this.axios.get('./'+name, {
            params: {}
        })
        .then((response) => {
             return response.data;
        });
    }
}