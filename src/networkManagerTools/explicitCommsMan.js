/**
 * @fileoverview This Class Manages everything related to explicit Communities. It reads the array with the keys
 * and change all nodes atributes based on their value of each of those explicit communities
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../namespaces/communities.js";
import { nodes } from "../namespaces/nodes.js";

export default class ExplicitCommsMan {

    /**
     * Constructor of the class
     * @param {NetworkMan} network networkManager parent object
     */
    constructor(network) {
        this.networkMan = network;

        //Contains all explicit Communities with its values
        this.communitiesData = new Array();

        /*Tracks the order of CommunityKeys to know what attribute each one changes.
        the order of this array determines what function of this.commChecker is used with the attribute*/
        this.commFilter = null;

        //Array with the functions that change node attributes based on the community value
        this.commChecker = [
            {
                change: (node, val) => this.changeBackgroundColor(node, val),
                init: (values) => this.initColorsFilter(values)
            },
            {
                change: (node, val) => this.changeShape(node, val),
                init: (values) => this.initShapesFilter(values)
            }
        ];
    }

    /** 
     * Execute while parsing nodes. It finds all explicit Community and all its values
     * @param {Object} node node with the explicit Community
     */
    findExplicitCommunities(node) {
        const explicitData = node[comms.ExpUserKsonKey];
        const keys = Object.keys(explicitData);

        keys.forEach((key) => {
            if (this.communitiesData.length === 0) {
                this.communitiesData.push({ key: key, values: new Array(explicitData[key]) });
            } else {
                let community = this.communitiesData.find(element => element.key === key);

                if (community === undefined) {
                    this.communitiesData.push({ key: key, values: new Array(explicitData[key]) });
                } else {
                    if (!community.values.includes(explicitData[key])) {
                        community.values.push(explicitData[key]);
                    }
                }
            }
        });
    }

    /**
     * Init all parameters to create a new filter.
     * @param {Object} communities Object with the format of {key: (string), values: (String[])}
     */
    initFilter(communities) {
        this.commFilter = communities;

        for (let i = 0; i < this.commChecker.length; i++) {
            const element = this.commChecker[i];
            element.init(this.commFilter[i].values);
        }
    }

    /**
     * Init the map with the communityValue -> Background Color relationship
     * @param {String[]} values values of the community that drives the node's color
     */
    initColorsFilter(values) {
        this.nodeColors = new Map();

        for (let i = 0; i < values.length; i++) {
            const color = comms.NodeAttr.getColor(i);
            this.nodeColors.set(values[i], color);
        }

    }

    /**
     * Init the map with the communityValue -> Shape relationship
     * @param {String[]} values values of the community that drives the node's shape
     */
    initShapesFilter(values) {
        this.nodeShapes = new Map();

        for (let i = 0; i < values.length; i++) {
            const shape = comms.NodeAttr.getShape(i);
            this.nodeShapes.set(values[i], shape);
        }
    }

    /**
     * Update the node attributes (color, shape, etc) based on the community Filter
     * @param {Object} node node to update
     */
    updateNodeVisuals(node) {
        for (let i = 0; i < this.commFilter.length; i++) {
            const nodeComms = node[comms.ExpUserKsonKey];
            const value = nodeComms[this.commFilter[i].key];

            this.commChecker[i].change(node, value);
        }
    }

    /**
     * Change the background color of the node to reflect its community
     * @param {Object} node node that is going to be edited
     * @param {String} value value of the node for this community
     */
    changeBackgroundColor(node, value) {
        this.networkMan.nodesMan.turnNodeColorToDefault(node, value);
    }

    /**
     * Change the shape of the node to reflect its community
     * @param {Object} node node that is going to be edited
     * @param {String} value value of the node for this community
     */
    changeShape(node, value) {
        const figure = this.nodeShapes.get(value);

        node["shape"] = figure.Shape;
        node.font = {
            vadjust: figure.vOffset,
        };
    }

    /**
     * Returns the background color for the requested node
     * @param {Object} node requested node
     * @param {String} value if we already know the value, we dont need to find it
     * @returns {String} Returns a string in the format of "rbg(255,255,255, 1)""
     */
    getNodeBackgroundColor(node, value) {
        if (this.commFilter !== null && this.commFilter.length >= 1) {

            if (value !== null) {
                return this.nodeColors.get(value);
            }

            const nodeComms = node[comms.ExpUserKsonKey];
            value = nodeComms[this.commFilter[0].key];

            return this.nodeColors.get(value);
        } else { 
            //If we dont have a filter or we are not filtering colors, we return the default color
            return nodes.NodeColor;
        }
    }

    /**
     * Make all nodes that doesnt have the selectedCommunities darker than usual
     * @param {Object} selectedCommunities Object with the format of {key: (string), values: (String[])}
     */
    highlightCommunities(selectedCommunities) {
        const n = selectedCommunities.length;

        //Update all nodes color acording to their selected status
        const newNodes = new Array();
        this.networkMan.data.nodes.forEach((node) => {
            let count = 0;
            for (let i = 0; i < n; i++) {
                if (this.nodeHasCommunity(node, selectedCommunities[i].key, selectedCommunities[i].values)) {
                    count++;
                }
            }

            if (count === n)
                this.networkMan.nodesMan.turnNodeColorToDefault(node)
            else
                this.networkMan.nodesMan.turnNodeDark(node)

            newNodes.push(node);
        });

        this.networkMan.data.nodes.update(newNodes);
    }

    /**
     * Function that check if the node has the community key and any of the values of that community
     * @param {Object} node node that is being checked
     * @param {String} key key of the community
     * @param {String[]} values valid values of the comunity
     * @returns {Boolean} Returns if it has the community
     */
    nodeHasCommunity(node, key, values) {
        for (let i = 0; i < values.length; i++) {

            if (node[comms.ExpUserKsonKey][key] === values[i])
                return true;
        }

        return false;
    }

    /**
     * Returns all detected Explicit Communities and the max size of our filter
     * @returns {Object} Object with the format of {data: {key: (string), values: (String[])}, filterSize: (int)}
     */
    getCommunitiesData() {
        return { data: this.communitiesData, filterSize: this.commChecker.length };
    }
}