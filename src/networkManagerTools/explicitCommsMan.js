/**
 * @fileoverview This Class Manages everything related to explicit Communities. It reads the array with the keys
 * and change all nodes atributes based on their value of each of those explicit communities
 * @author Marco Expósito Pérez
 */

//Namespaces
import { comms } from "../namespaces/communities.js";

export default class ExplicitCommsMan {

    /**
     * Constructor of the class
     * @param {DrawNetwork} network DrawNetwork parent object
     * @param {Array} communitiesKeys Array with the key values that are going to change how nodes are view
     */
    constructor(network, communitiesKeys = null) {
        this.drawNetwork = network;

        //DEBUG. This should be an input from the user
        communitiesKeys = new Array("ageGroup", "language");

        /*Tracks the order of CommunityKeys to know what attribute each one changes.
        the order of this array determines what function of this.commChecker is used with the attribute*/
        this.commOrder = communitiesKeys;

        //Array with the functions that change node attributes based on the community value
        this.commChecker = [
            (node, val) => this.changeBackgroundColor(node, val),
            (node, val) => this.changeShape(node, val)
        ];

        this.initNewFilter();
    }

    /**
     * Init community Arrays for a new iteration of the explicit Community Filtering
     */
    initNewFilter() {
        this.commsValues = new Array();

        for (let i = 0; i < this.commOrder.length; i++) {
            const newComm = { key: "", values: [] };
            newComm.key = this.commOrder[i];

            this.commsValues.push(newComm);
        }

        this.nodeColors = new Map();
        this.nodeShapes = new Map();
    }

    /**
     * Look for the Explicit Communities of the node and edit its attributes based on them
     * @param {Object} node node that is going to be edited
     */
    lookForExplicitCommunities(node) {
        for (let i = 0; i < this.commOrder.length; i++) {
            const nodeComms = node[comms.ExpUserKsonKey];
            const value = nodeComms[this.commOrder[i]];

            this.commChecker[i](node, value);
        }
    }


    /**
     * Change the background color of the node to reflect its community
     * @param {Object} node node that is going to be edited
     * @param {String} value value of the node for this community
     */
    changeBackgroundColor(node, value) {
        if (!this.commsValues[0].values.includes(value)) {
            this.commsValues[0].values.push(value);

            const n = this.commsValues[0].values.length - 1;
            const color = comms.NodeAttr.getColor(n);

            this.nodeColors.set(value, color);
        }

        this.drawNetwork.nodesMan.turnNodeColorToDefault(node);
    }

    /**
     * Change the shape of the node to reflect its community
     * @param {Object} node node that is going to be edited
     * @param {String} value value of the node for this community
     */
    changeShape(node, value) {
        if (!this.commsValues[1].values.includes(value)) {
            this.commsValues[1].values.push(value);

            const n = this.commsValues[1].values.length - 1;
            const shape = comms.NodeAttr.getShape(n);

            this.nodeShapes.set(value, shape);
        }

        const figure = this.nodeShapes.get(value);

        node.shape = figure.Shape;
        node.font = {
            vadjust: figure.vOffset,
        };
    }

    /**
     * Returns the background color for the requested node
     * @param {Object} node requested node
     * @returns {String} Returns a string in the format of "rbg(255,255,255, 1)""
     */
    getNodeBackgroundColor(node) {
        const nodeComms = node[comms.ExpUserKsonKey];
        const key = nodeComms[this.commOrder[0]];

        return this.nodeColors.get(key);
    }

    /**
     * Returns the shape for the requested node
     * @param {Object} node requested node
     * @returns {Object} Returns an object with the format: "{shape: (String), vOffset: (integer), selOffset: (integer)} 
     */
    getNodeShape(node) {
        const nodeComms = node[comms.ExpUserKsonKey];
        const key = nodeComms[this.commOrder[1]];

        return this.nodeShapes.get(key);
    }

    /**
     * Make all nodes that doesnt have the selectedCommunities darker than usual
     * @param {Object} selectedCommunities Object with the format of {key: (string), values: (String[])}
     */
    highlightCommunities(selectedCommunities) {
        const n = selectedCommunities.length;

        //Update all nodes color acording to their selected status
        const newNodes = new Array();
        this.drawNetwork.data.nodes.forEach((node) => {
            let count = 0;
            for (let i = 0; i < n; i++) {
                if (this.nodeHasCommunity(node, selectedCommunities[i].key, selectedCommunities[i].values)) {
                    count++;
                }
            }

            if (count === n)
                this.drawNetwork.nodesMan.turnNodeColorToDefault(node)
            else
                this.drawNetwork.nodesMan.turnNodeDark(node)

            newNodes.push(node);
        });

        this.drawNetwork.data.nodes.update(newNodes);
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
     * Returns current filtered communities and its values
     * @returns {Object} Object with the format of {key: (string), values: (String[])}
     */
    getCommunities() {
        return this.commsValues;
    }
}