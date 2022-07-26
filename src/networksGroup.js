/**
 * @fileoverview This class works as a controler between user input and all active networks.It also works
 * to broadcast and manage events between diferent networks. 
 * @author Marco Expósito Pérez
 */

//Local classes
import NetworkMan from "./networkManager.js";
import Tooltip from "./networkManagerTools/tooltip.js";

export default class NetworksGroup {

    /**
     * Constructor of the class
     */
    constructor() {
        this.activesNetworksMap = new Map();
        this.activesNetworksArray = new Array();

        this.tooltip = new Tooltip();
    }

    setLayout(layout){
        this.layout = layout;
    }

    /** 
     * Create and add a network to the web
     * @param {String} key Identifier of the new network
     * @param {File} file File with the config of the network
     * @param {HTMLElement} networkContainer Container where the network will be placed
     * @param {HTMLElement} dataTableContainer Container where the dataTable will be placed
     */
    addNetwork(file, networkContainer, dataTableContainer, config) {
        let jsonFile;
        let network;

        try {
            jsonFile = JSON.parse(file);  
        } catch (err) {
            err.message = `${config.key} json parsing has failed: ${err.message}`;
            return err;
        }

        try {
            network = new NetworkMan(jsonFile, networkContainer, dataTableContainer, this, config);

        } catch(err){
            err.message = `${config.key} creation has failed: ${err.message}`;
            return err;
        }
        
        this.activesNetworksMap.set(config.key, network);
        this.activesNetworksArray.push(network);

        return 200;
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

            this.layout.deleteNetwork(key);
  
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

        network.edgesMan.hideUnselectedEdges(newBool, network.selectedEdges);
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
