import DrawNetwork from "./drawNetwork";

export default class NetworkManager {

    constructor() {
        this.activesNetworksMap = new Map();
        this.activesNetworksArray = new Array();
    }

    /** Create and add a network to the web
     * 
     * @param {*} key Identifier of the new network
     * @param {*} file File with the config of the network
     * @param {*} container Container where the network will be placed
     */
    addNetwork(key, file, container) {
        try {
            const config = {
                edgeThreshold: document.getElementById("thresholdSlider_" + key).value,
                variableEdge: document.getElementById("thresholdVariableCheck_" + key).checked,
            };

            const jsonFile = JSON.parse(file);

            const network = new DrawNetwork(jsonFile, container, this, config);
            network.key = key;

            this.activesNetworksMap.set(key, network);
            this.activesNetworksArray.push(network);

        } catch (e) {
            console.log(e);

            alert("The file is not a valid json file");
        }
    }

    /** Remove the network and the html div related
     * 
     * @param {*} key //Key of the network
     */
    removeNetwork(key) {
        const network = this.activesNetworksMap.get(key);
        
        this.activesNetworksArray = this.activesNetworksArray.filter( data => data.key != key);

        network.clearNetwork();

        const networkContainer = document.getElementById("networksContainer");
        const divToDelete = document.getElementById("network_" + key);

        networkContainer.removeChild(divToDelete);
    }

    /** Broadcast to all networks that node id has been selected
     * 
     * @param {*} id id of the selected node
     */
    nodeSelected(id){
        this.activesNetworksArray.forEach( (network) => network.nodeSelected(id) );
    }

    /** Broadcast to all networks that there is not a node selected
     * 
     */
    nodeDeselected(){
        this.activesNetworksArray.forEach( (network) => network.nodeDeselected() );
    }

    /** Change the network threshold value
     * 
     * @param {*} key Key of the network
     * @param {*} newValue New value of the threshold
     */
    thresholdChange(key, newValue){
        const network = this.activesNetworksMap.get(key);
        
        network.hideEdgesbelowThreshold(newValue);
    }

    /** Change the key network variableEdge value
     * 
     * @param {*} key Key of the network
     * @param {*} newBool New variableEdge value
     */
    variableEdgeChange(key, newBool){
        const network = this.activesNetworksMap.get(key);
        
        network.updateVariableEdge(newBool);
    }
}
