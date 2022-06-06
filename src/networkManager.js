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
     * @param {*} leftContainer Container where the network will be placed
     * @param {*} rightContainer Container where the network data will be placed
     */
    addNetwork(file, leftContainer, rightContainer, config) {
        try {
            const jsonFile = JSON.parse(file);
            const network = new DrawNetwork(jsonFile, leftContainer, rightContainer, this, config);

            this.activesNetworksMap.set(config.key, network);
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

        this.activesNetworksArray = this.activesNetworksArray.filter(data => data.key != key);

        network.clearNetwork();

        const networkContainer = document.getElementById("networksContainer");
        const divToDelete = document.getElementById("network_" + key);

        networkContainer.removeChild(divToDelete);
    }

    /** Set the current active popup. There is only one across all networks
     * 
     * @param {*} newTooltip new bootstrap popover object
     */
    setTooltip(newTooltip) {
        this.tooltip = newTooltip;
    }

    /** Broadcast to all networks that node id has been selected
     * 
     * @param {*} id id of the selected node
     */
    nodeSelected(id) {
        if (this.tooltip !== undefined) this.tooltip.hide();

        this.activesNetworksArray.forEach((network) => network.nodeSelected(id));
    }

    /** Broadcast to all networks that there is not a node selected
     * 
     */
    nodeDeselected() {
        if (this.tooltip !== undefined) this.tooltip.hide();

        this.activesNetworksArray.forEach((network) => network.nodeDeselected());
    }

    /** Change the network threshold value
     * 
     * @param {*} key Key of the network
     * @param {*} newValue New value of the threshold
     */
    thresholdChange(key, newValue) {
        const network = this.activesNetworksMap.get(key);

        network.hideEdgesbelowThreshold(newValue);
    }

    /** Change the key network variableEdge value
     * 
     * @param {*} key Key of the network
     * @param {*} newBool New variableEdge value
     */
    variableEdgeChange(key, newBool) {
        const network = this.activesNetworksMap.get(key);

        network.updateVariableEdge(newBool);
    }

    highlightCommunity(key, selectedCommunities){
        const network = this.activesNetworksMap.get(key);

        network.highlightCommunity(selectedCommunities);
    }

    thresholdChangeALL(newValue) {
        this.activesNetworksArray.forEach((network) => {
            this.thresholdChange(network.key, newValue);
        });
    }


    variableEdgeChangeALL(newBool) {
        this.activesNetworksArray.forEach((network) => {
            this.variableEdgeChange(network.key, newBool);
        });
    }

    highlightCommunityALL(selectedCommunities){
        this.activesNetworksArray.forEach((network) => {
            this.highlightCommunity(network.key, selectedCommunities);
        });
    }

    getNnetworks(){
        return this.activesNetworksArray.length;
    }

    getExplicitCommunities(){
        return this.activesNetworksArray[0].getExplicitCommunities();
    }
}
