/**
 * @fileoverview This Class Controls all GET petitions to obtain the json files with the networks data.
 * @package Requires Axios package to be able to send the GET petitions.  
 * @author Marco Expósito Pérez
 */

//Packages
import { Axios } from 'axios'

export default class RequestManager {
    /**
     * Constructor of the class
     * @param {String} baseURL base url of all axios petitions
     */
    constructor(baseURL) {
        this.axios = new Axios({
            baseURL: baseURL,
            headers: {
                'Access-Control-Allow-Origin': 'file:',
            }
        });
    }

    /**
     * Send a GET petition to obtain a singleFile in a directory
     * @param {String} name Name of the file we want to get. It needs to include the extension
     * @param {String} directory Optional parameter to change the target directory
     * @returns 
     */
    getFile(name, directory = "./") {
        return this.axios.get(directory + name, {
            params: {}
        })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                return error;
            });
    }
}