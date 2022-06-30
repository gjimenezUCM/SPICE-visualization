/**
 * @fileoverview This class holds the data of the nodes and show that data using a tooltip 
 * when a nodes is clicked and also shows that data in a dataTable
 * @package It requires vis-data package to be able to use vis-network datasets. 
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../constants/nodes.js";
import { comms } from "../constants/communities.js";
import { networkHTML } from "../constants/networkHTML.js";
//Packages
import { DataSet } from "vis-data/peer";
//Local classes
import dataTable from "./dataTable.js";

export default class NodeData {

    /**
     * Constructor of the class
     * @param {NodeVisuals} nodeVisuals Object that holds the visualization options for nodes
     */
    constructor(nodeVisuals) {
        this.nodeVisuals = nodeVisuals;
    }

    /**
     * Parse the json into a proper nodes Dataset used to draw the network
     * @param {Object} json json with the nodes data
     * @returns {DataSet} a vis.js DataSet with the nodes data ready to draw the network
     */
    parseNodes(json) {
        for (let node of json[nodes.UsersGlobalJsonKey]) {
            this.nodeVisuals.findExplicitCommunities(node);

            //The implicit community will be used for the bounding boxes
            node[comms.ImplUserNewKey] = parseInt(node[comms.ImplUserJsonKey]);

            //Vis uses "group" key to change the color of all nodes with the same key. We need to remove it
            if (comms.ImplUserJsonKey === "group")
                delete node["group"];

            node["defaultColor"] = true;
        }
        this.nodes = new DataSet(json.users);

        return this.nodes;
    }

    /**
     * Create and empty dataTable with the user attributes we want to show and all of its explicit
     * community attributes
     * @param {HTMLElement} container container of the dataTable
     */
    createNodeDataTable(container) {
        this.dataTable = new dataTable(container);

        const tittle = nodes.NodesTableTitle;

        //First we show the data that we want that is not from explicit communities
        const rowsData = new Array();
        for (let i = 0; i < nodes.NodesWantedAttr.length; i++) {
            rowsData.push({
                class: nodes.borderMainHTMLrow,
                title: `<strong> ${nodes.NodesWantedAttr[i]} </strong>`,
                data: ""
            });
        }

        //Change the border color to show the separation between "normal data" and explicit communities
        let lastMainrow = rowsData.pop();
        lastMainrow.class = nodes.borderSeparatorHTMLrow;
        rowsData.push(lastMainrow);

        //Include communities data
        const communities = this.nodeVisuals.communitiesData;
        for (let i = 0; i < communities.length; i++) {
            rowsData.push({
                class: nodes.borderHTMLrow,
                title: communities[i].key,
                data: ""
            });
        }

        //Remove the border of the last row
        lastMainrow = rowsData.pop();
        lastMainrow.class = nodes.borderlessHTMLrow;
        rowsData.push(lastMainrow);

        this.dataTable.createDataTable(rowsData, tittle)
    }

    /**
     * Update the dataTable based on the id of a node 
     * @param {Integer} id id of the node
     */
    updateDataTable(id) {
        const node = this.nodes.get(id);

        const newRowData = new Map();

        //First we include the wanted attributes
        for (let i = 0; i < nodes.NodesWantedAttr.length; i++) {
            newRowData.set(nodes.NodesWantedAttr[i], node[nodes.NodesWantedAttr[i]]);
        }

        //Then we add the explicit community ones
        const communities = node[comms.ExpUserKsonKey];
        const keys = Object.keys(communities);

        for (let i = 0; i < keys.length; i++) {
            newRowData.set(keys[i], communities[keys[i]]);
        }

        this.dataTable.updateDataTable(newRowData)
    }


    /**
     * Clears all data from the dataTable
     */
    clearDataTable() {
        this.dataTable.clearDataTable();
    }

    /**
     * Calculate the spawning point of the tooltip
     * @param {NetworkManager} networkManager Manager of the network where the tooltip is going to be draw
     * @param {Object} event Event with the location of the user click
     * @param {Function} getElementPosition Function that returns the DOM position of a HTML element
     * @returns {Object} returns an object with the spawn Point.
     * Format-> { x: (integer), y: (integer) } 
     */
    calculateTooltipSpawn(networkManager, event, getElementPosition) {
        //Calculate the relative position of the click in the canvas
        const nodeInCanvasPosition = networkManager.network.getPosition(event.nodes[0]);
        const nodeInCanvasDOMposition = networkManager.network.canvasToDOM(nodeInCanvasPosition);

        //Depending on the zoom, we increase the offset
        const xOffset = networkManager.network.getScale() * 40;

        //Calculate the real absolute click coordinates
        const networkCanvasPosition = getElementPosition(`${networkHTML.topCanvasContainer}${networkManager.key}`)
        const clickX = nodeInCanvasDOMposition.x + networkCanvasPosition.left + xOffset;
        const clickY = nodeInCanvasDOMposition.y + networkCanvasPosition.top;

        return { x: clickX, y: clickY };
    }

    /**
     * Returns the Title of the tooltip
     * @param {NetworkManager} networkManager (unused)
     * @param {Object} event Event with the node id that has been clicked
     * @param {Function} titleTemplate Function that returns the html template of the tooltip tittle
     * @returns {String} String with the tootip tittle
     */
    getTooltipTitle(networkManager, event, titleTemplate) {
        const node = this.nodes.get(event.nodes[0]);
        const title = node.label;


        return titleTemplate(title);
    }

    /**
     * Returns the Content of the tooltip
     * @param {NetworkManager} networkManager (unused)
     * @param {Object} event Event with the node id that has been clicked
     * @param {Function} contentTemplate Function that returns the html template of the tooltip content
     * @returns {String} String with the tootip content
     */
    getTooltipContent(networkManager, event, contentTemplate) {
        const node = this.nodes.get(event.nodes[0]);
        const rowData = new Array();

        rowData.push({ tittle: "Label", data: node.label });
        rowData.push({ tittle: "Group", data: node[comms.ImplUserNewKey] });

        const keys = Object.keys(node[comms.ExpUserKsonKey]);
        for (let i = 0; i < keys.length; i++) {
            rowData.push({ tittle: keys[i], data: node[comms.ExpUserKsonKey][keys[i]] });
        }

        return contentTemplate(rowData);
    }



}