/**
 * @fileoverview This Class works as a controler between user input and all active networks.It also works
 * to broadcast and manage events between diferent networks. 
 * @author Marco Expósito Pérez
 */

//Namespace
import { networkHTML } from "./constants/networkHTML.js";
//Local classes
import NetworkMan from "./networkManager.js";

export default class NetworkGroupMan {

    /**
     * Constructor of the class
     */
    constructor() {
        this.activesNetworksMap = new Map();
        this.activesNetworksArray = new Array();

        this.tooltip = null;
        this.tooltipContainer = null;
    }

    /** 
     * Create and add a network to the web
     * @param {String} key Identifier of the new network
     * @param {File} file File with the config of the network
     * @param {HTMLElement} leftContainer Container where the network will be placed
     * @param {HTMLElement} rightContainer Container where the network data will be placed
     */
    addNetwork(file, leftContainer, rightContainer, config) {
        try {
            const jsonFile = JSON.parse(file);
            const network = new NetworkMan(jsonFile, leftContainer, rightContainer, this, config);

            this.activesNetworksMap.set(config.key, network);
            this.activesNetworksArray.push(network);

        } catch (e) {
            console.log(e);
            alert("The file is not a valid json file");
        }
    }

    /** 
     * Remove the network and the html div related
     * @param {String} key //Key of the network
     */
    removeNetwork(key) {
        const network = this.activesNetworksMap.get(key);

        this.activesNetworksArray = this.activesNetworksArray.filter(data => data.key != key);

        network.clearNetwork();

        const networkContainer = document.getElementById(networkHTML.networksParentContainer);
        const divToDelete = document.getElementById(networkHTML.topNetworkContainer + key);

        networkContainer.removeChild(divToDelete);
    }

    /** 
     * Broadcast to all networks that node id has been selected
     * @param {Integer} id id of the selected node
     */
    nodeSelected(id) {
        this.hidePopover();
        this.activesNetworksArray.forEach((network) => network.nodeSelected(id));
    }

    /** 
     * Broadcast to all networks that no node was selected
     */
    nodeDeselected() {
        this.hidePopover();
        this.activesNetworksArray.forEach((network) => network.nodeDeselected());
    }


    /** 
     * Change the network threshold value
     * @param {String} key Key of the network
     * @param {Float} newValue New value of the threshold
     */
    thresholdChange(key, newValue) {
        const network = this.activesNetworksMap.get(key);

        network.edgesMan.updateEdgesThreshold(newValue);
    }

    /**
     * Broadcast the newThreshold value to all networks
     * @param {Float} newValue newValue New value of the threshold
     */
    thresholdChangeALL(newValue) {
        this.activesNetworksArray.forEach((network) => {
            this.thresholdChange(network.key, newValue);
        });
    }

    /** 
     * Change the network variable edge value
     * @param {String} key Key of the network
     * @param {Boolean} newBool New variableEdge value
     */
    variableEdgeChange(key, newBool) {
        const network = this.activesNetworksMap.get(key);

        network.edgesMan.updateVariableEdge(network, newBool);
    }

    /**
     * Broadcast the newVariableEdge value to all networks
     * @param {Float} newValue New variableEdge value
     */
    variableEdgeChangeALL(newBool) {
        this.activesNetworksArray.forEach((network) => {
            this.variableEdgeChange(network.key, newBool);
        });
    }

    /**
     * Highlight all nodes that contains selectedCommunities key and values
     * @param {String} key Key of the network
     * @param {Object} selectedCommunities Object with the format of {key: (string), values: (String[])}
     */
    highlightCommunity(key, selectedCommunities) {
        const network = this.activesNetworksMap.get(key);

        network.highlightCommunity(selectedCommunities);
    }

    /**
     * Broadcast the highglight a selected community to all networks
     * @param {Object} selectedCommunities Object with the format of {key: (string), values: (String[])}
     */
    highlightCommunityALL(selectedCommunities) {
        this.activesNetworksArray.forEach((network) => {
            this.highlightCommunity(network.key, selectedCommunities);
        });
    }

    /**
     * Update node visuals of a network to match current blacklist filter
     * @param {String[]} filter string array with all values to hide
     */
    updateFilterActives(key, filter) {
        const network = this.activesNetworksMap.get(key);

        network.updateFilterActives(filter);
    }

    /**
     * Update node visuals of all networks to match current blacklist filter
     * @param {String[]} filter string array with all values to hide
     */
    updateFilterActivesALL(filter) {
        this.activesNetworksArray.forEach((network) => {
            this.updateFilterActives(network.key, filter);
        });
    }

    /**
     * Hide the current active popover
     */
    hidePopover() {
        if (this.tooltip !== null) { this.tooltip.hide(); }
    }

    /**
     * Returns the current number of active networks
     * @returns {Integer} Returns the number of active networks
     */
    getNnetworks() {
        return this.activesNetworksArray.length;
    }

    /**
     * Returns the attributes that changes visualization
     * @returns {Object} Object with the attributes that change visualization
     * Format-> {attr: (string), vals: (string[], dimension: (string))}
     */
     getVisualizationAttributes() {
        return this.activesNetworksArray[0].getVisualizationAttributes();
    }
}
