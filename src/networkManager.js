import DrawNetwork from "./drawNetwork";

export default class NetworkManager {

    constructor() {
        this.activesNetworksMap = new Map();
        this.activesNetworksArray = new Array();
    }

    /** Add a network using the file parameter as the source json
      * 
      * @param {*} file name of the file that will be used as data 
      */
    addNetwork(name, file) {
        try {
            const networkContainer = document.getElementById("networksContainer");

            const newNetwork = document.createElement('div');
            newNetwork.id = "network_" + name;
            newNetwork.className = "middle network";

            networkContainer.appendChild(newNetwork);

            const jsonFile = JSON.parse(file);

            const network = new DrawNetwork(jsonFile, newNetwork, this);
            network.name = name;

            this.activesNetworksMap.set(name, network);
            this.activesNetworksArray.push(network);

        } catch (e) {
            console.log(e);

            alert("The file is not a valid json file");
        }
    }
    /** Remove  the network and the html div related to the name parameter
     * 
     * @param {*} name //Parameter used to identify the network and div to delete
     */
    removeNetwork(name) {
        const network = this.activesNetworksMap.get(name);
        
        this.activesNetworksArray = this.activesNetworksArray.filter( data => data.name != name);

        network.clearNetwork();

        const networkContainer = document.getElementById("networksContainer");
        const divToDelete = document.getElementById("network_" + name);

        networkContainer.removeChild(divToDelete);
    }



    nodeSelected(id){
        this.activesNetworksArray.forEach( (network) => network.nodeSelected(id) );
    }

    nodeDeselected(){
        this.activesNetworksArray.forEach( (network) => network.nodeDeselected() );
    }

}
