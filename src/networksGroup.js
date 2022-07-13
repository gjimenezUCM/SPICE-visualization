/**
 * @fileoverview This class works as a controler between user input and all active networks.It also works
 * to broadcast and manage events between diferent networks. 
 * @author Marco Expósito Pérez
 */

//Namespace
import { networkHTML } from "./constants/networkHTML.js";

//Local classes
import NetworkMan from "./networkManager.js";
import Tooltip from "./networkManagerTools/tooltip.js";

export default class NetworksGroup {

    /**
     * Constructor of the class
     */
    constructor(initialOptions) {
        this.initialOptions = initialOptions;
        this.secondNetworkTag = this.initialOptions.secondNetworkTag;

        this.activesNetworksMap = new Map();
        this.activesNetworksArray = new Array();

        this.tooltip = new Tooltip();
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
        this.hideTooltip();

        const network = this.activesNetworksMap.get(key);

        if (network !== undefined) {
            this.activesNetworksArray = this.activesNetworksArray.filter(data => data.key != key);

            network.clearNetwork();

            if (key.length <= this.secondNetworkTag.length || key.slice(key.length -this.secondNetworkTag.length) !== this.secondNetworkTag) {
                //Its a main network
                const networkContainer = document.getElementById(networkHTML.networksParentContainer);
                const pairContainer = document.getElementById(`${key}PairNetworkContainer`);

                //Remove the secondary network if it exist
                const secondaryKey = `${key}${this.secondNetworkTag}`;
                if(this.activesNetworksMap.get(secondaryKey) !== undefined){

                    this.removeNetwork(secondaryKey);
                    this.initialOptions.disactivateDropdownOption(`${key}${this.secondNetworkTag}`);

                }
                //Remove this network/key from the needPairKeys array
                for(let i = 0; i < this.initialOptions.needPairKeys.length; i++){
                    if(this.initialOptions.needPairKeys[i] === key){
                        this.initialOptions.needPairKeys.splice(i, 1); 
                    }
                }
                
                networkContainer.removeChild(pairContainer);
            } else {
                //Its a secondary network
                //Add the main network to the needPairKeys array
                const mainKey = key.slice(0, -this.secondNetworkTag.length);

                this.initialOptions.needPairKeys.push(mainKey);

                const otherNetworkContainer = document.getElementById(`leftCol_${mainKey}`);
                otherNetworkContainer.className = "col-sm-8 networkContainer";

                const network = this.activesNetworksMap.get(mainKey);

                setTimeout(() => network.network.fit(), 1);
            }

            this.activesNetworksMap.delete(key);
        }
    }

    /**
     * Remove all networks of the visualization
     */
    removeAllnetworks() {
        this.activesNetworksArray.forEach((network) => {
            this.removeNetwork(network.key);
        });
    }

    /** 
     * Broadcast to all networks that node id has been selected
     * @param {Integer} id id of the selected node
     */
    nodeSelected(id) {
        this.activesNetworksArray.forEach((network) => network.nodeSelected(id));
    }

    /** 
     * Broadcast to all networks that no node was selected
     */
    nodeDeselected() {
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
     * Change the network hideUnselectedEdges value
     * @param {String} key Key of the network
     * @param {Boolean} newBool New hideUnselectedEdges value
     */
    hideUnselectedEdges(key, newBool) {
        const network = this.activesNetworksMap.get(key);

        network.edgesMan.hideUnselectedEdges(newBool);
    }

    /**
     * Broadcast the new hideUnselectedEdges value to all networks
     * @param {Boolean} newValue New hideUnselectedEdges value
     */
    hideUnselectedEdgesALL(newBool) {
        this.activesNetworksArray.forEach((network) => {
            this.hideUnselectedEdges(network.key, newBool);
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
     * Change the network allowThirdDimension value
     * @param {String} key Key of the network
     * @param {Boolean} newBool New allowThirdDimension value
     */
    changeThirdDimension(key, newBool) {
        const network = this.activesNetworksMap.get(key);

        network.changeThirdDimension(newBool);
    }

    /**
     * Broadcast the new allowThirdDimension value to all networks
     * @param {Boolean} newValue New allowThirdDimension value
     */
    changeThirdDimensionALL(newBool) {
        this.activesNetworksArray.forEach((network) => {
            this.changeThirdDimension(network.key, newBool);
        });
    }

    /** 
     * Change the network nodeLabelVisibility value
     * @param {String} key Key of the network
     * @param {Boolean} newBool New nodeLabelVisibility value
     */
    nodeLabelVisibilityChange(key, newBool) {
        const network = this.activesNetworksMap.get(key);

        network.nodeLabelVisibilityChange(newBool);
    }
    /**
     * Broadcast the new nodeLabelVisibility value to all networks
     * @param {Boolean} newValue New nodeLabelVisibility value
     */
    nodeLabelVisibilityChangeALL(newValue) {
        this.activesNetworksArray.forEach((network) => {
            this.nodeLabelVisibilityChange(network.key, newValue);
        });
    }
    /**
     * Hide the current active popover
     */
    hideTooltip() {
        this.tooltip.hide();
    }

    /**
     * Create a new tooltip
     * @param {NetworkManager} networkManager networkManager where the tooltip is going to be draw
     * @param {Object} event Event that trigered the tooltip
     * @param {Object} tooltipManager Object that will manage the tooltip creation
     */
    createTooltip(networkManager, event, tooltipManager) {
        this.tooltip.createTooltip(networkManager, event, tooltipManager);
    }

    /**
     * Show a tooltip previously created
     */
    showTooltip() {
        this.tooltip.show();
    }

    /**
     * Updates a tooltip position
     */
    updateTooltipPosition() {
        this.tooltip.updatePosition();
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
