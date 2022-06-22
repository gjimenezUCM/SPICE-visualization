/**
 * @fileoverview This class controls the visualization of the data of the nodes. The datatable and the tooltip
 * @package It requires vis-data package to be able to use vis-network datasets. 
 * @package It requires bootstrap to be able to draw popovers.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../constants/nodes.js";
import { comms } from "../constants/communities.js";
import { networkHTML } from "../constants/networkHTML.js";
//Packages
import { DataSet } from "vis-data/peer";
import { Popover } from 'bootstrap';
import dataTable from "./dataTable.js";

export default class NodeData {

    /**
     * Constructor of the class
     * @param {ExplicitCommsMan} explicitMan Explicit manager of the network
     * @param {HTMLElement} container Container where the datatable will be placed
     */
    constructor(explicitMan, container) {
        this.explCommMan = explicitMan;
        this.container = container;

        this.tooltip = null;
    }

    /**
     * Parse the json into a proper nodes Dataset to use to draw the network
     * @param {Object} json json with the nodes data
     * @returns {DataSet} a vis.js DataSet with the nodes data ready to draw the network
     */
    parseNodes(json) {
        for (let node of json[nodes.UsersGlobalJsonKey]) {
            this.explCommMan.findExplicitCommunities(node);

            //The implicit community will be used for the bounding boxes
            node[comms.ImplUserNewKey] = parseInt(node[comms.ImplUserJsonKey]);

            //Vis uses "group" key to change the color of all nodes with the same key. We need to remove it
            if (comms.ImplUserJsonKey === "group")
                delete node["group"];

            node["defaultColor"] = true;

            this.nExplCommunities = Object.keys(node[comms.ExpUserKsonKey]).length;
        }
        this.nodes = new DataSet(json.users);

        return this.nodes;
    }

    /**
     * Create the Table/html with the data about the selected node. Its empty if none is selected
     */
    createNodeDataTable() {
        this.dataTable = new dataTable(this.container);

        const tittle = "User Attributes";

        //First we show the data that we want that is not from explicit communities
        const rowsData = new Array();
        for (let i = 0; i < nodes.NodesWantedAttr.length; i++) {
            rowsData.push({
                class: nodes.borderMainHTMLrow,
                title: `<strong> ${nodes.NodesWantedAttr[i]} </strong>`,
                data: ""
            });
        }

        //Change the border color to show the separation between "normaldata" and explicit communities
        let lastMainrow = rowsData.pop();
        lastMainrow.class = nodes.borderSeparatorHTMLrow;
        rowsData.push(lastMainrow);

        //Include communities data
        const communities = this.explCommMan.communitiesData;
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

        return;
    }

    /**
     * Update the data panel to show a node's data
     * @param {integer} id the id of the node
     */
    updateDataPanel(id) {
        const node = this.nodes.get(id);

        const newRowData = new Map();

        for (let i = 0; i < nodes.NodesWantedAttr.length; i++) {
            newRowData.set(nodes.NodesWantedAttr[i], node[nodes.NodesWantedAttr[i]]);
        }

        const communities = node[comms.ExpUserKsonKey];
        const keys = Object.keys(communities);

        for (let i = 0; i < keys.length; i++) {
            newRowData.set(keys[i], communities[keys[i]]);
        }

        this.dataTable.updateDataTable(newRowData)
    }


    /**
    * Clear all data from DataPanel while mantaining the important keys
    */
    clearDataPanel() {
        this.dataTable.clearDataTable();
    }

    calculateTooltipSpawn(networkManager, event, getElementPosition) {
        //Calculate the relative position of the click in the canvas
        const nodeInCanvasPosition = networkManager.network.getPosition(event.nodes[0]);
        const nodeInCanvasDOMposition = networkManager.network.canvasToDOM(nodeInCanvasPosition);

        //Depending on the zoom, we increase the offset
        const xOffset = networkManager.network.getScale() * 40;

        //Calculate the real absolute click coordinates
        const networkCanvasPosition = getElementPosition(networkHTML.topCanvasContainer + networkManager.key)
        const clickX = nodeInCanvasDOMposition.x + networkCanvasPosition.left + xOffset;
        const clickY = nodeInCanvasDOMposition.y + networkCanvasPosition.top;

        return { x: clickX, y: clickY };
    }

    getTooltipTitle(networkManager, event, titleTemplate) {
        const node = this.nodes.get(event.nodes[0]);
        const title = node.label;


        return titleTemplate(title);
    }


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