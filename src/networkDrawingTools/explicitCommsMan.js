import { comms } from "../namespaces/communities.js";

export default class ExplicitCommsMan {

    constructor(network, communitiesKeys = null) {
        this.network = network;

        //DEBUG
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
            const color = comms.nodeAttr.getColor(n);

            this.nodeColors.set(value, color);
        }

        this.network.turnNodeColorToDefault(node);
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
            const shape = comms.nodeAttr.getShape(n);

            this.nodeShapes.set(value, shape);
        }

        const figure = this.nodeShapes.get(value);

        node.shape = figure.shape;
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


    getCommunities(){
        return this.commsValues;
    }
}